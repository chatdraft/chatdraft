import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { shuffle } from './utils';
import { getRandomDeckName } from './draftNames';
import { DatetimeNowUtc } from '$lib/datetime';
import { GetDeckCode, LookupCard, type Card, type Deck } from '$lib/snap/cards';
import { seconds_to_ms } from '$lib/constants';

/**
 * Represents a serializable instance of a running or previous draft
 *
 * @export
 * @interface IDraft
 * @typedef {IDraft}
 */
export default interface IDraft {
	cards: Deck;
	total: number;
	player: string;
	currentChoice: Choice | undefined;
	duration: number;
	selections: number;
	deckName: string;
	viewerDeck: Deck;
	viewerName: string | undefined;
}

/**
 * Represents an instance of an active or previous Oro Chat Draft
 *
 * @export
 * @class Draft
 * @typedef {Draft}
 * @extends {EventEmitter}
 * @implements {IDraft}
 */
export class Draft extends EventEmitter implements IDraft {
	private voteTimer: NodeJS.Timeout | undefined;
	public deckName: string = '';

	public startTime: number | undefined;
	public finishTime: number | undefined;

	public get lobbyName(): string | null {
		return this._lobbyName;
	}

	/**
	 * Creates an instance of Draft.
	 *
	 * @constructor
	 * @public
	 * @param {string} player_channel The Twitch User channel that is associated with this draft
	 * @param {number} duration The duration that voters have to decide
	 * @param {number} selections The number of selections per voting period
	 * @param {{all: {cardDefKey: string, variantKey: null, url: string, name: string, description: string, displayImageUrl: string, cost: number}[]}} all_cards The list of cards to use for the draft
	 * @param {boolean} [subsExtraVote=false] Whether subscribers get +1 extra vote added
	 * @param {(string[] | null)} collection The user's available collection.
	 * @param {string} viewerName The chatter also drafting in a viewer battle if any
	 */
	public constructor(
		public player: string,
		public duration: number,
		public selections: number,
		private all_cards: {
			cardDefKey: string;
			variantKey: null;
			url: string;
			name: string;
			description: string;
			displayImageUrl: string;
			cost: number;
		}[],
		private subsExtraVote = false,
		collection: string[] | null = null,
		public viewerName: string | undefined = undefined,
		private featuredCardMode: string = 'off',
		private featuredCardDefKey: string = '',
		private _lobbyName: string | null = null,
		public voteTimerOffset: number = 5
	) {
		super();

		if (collection) {
			this.all_cards = all_cards.filter((card) => collection.includes(card.cardDefKey));
		}
	}

	cards: Deck = [];
	total: number = 0;
	currentChoice: Choice | undefined;
	started: boolean = false;

	// The viewer chat draft battle viewer and their vote and cards
	battleVote: Card | undefined;
	viewerDeck: Deck = [];

	onDraftStarted =
		this.registerEvent<
			[player_channel: string, lobbyName: string | null, battleChatter: string | undefined]
		>();

	onNewChoice =
		this.registerEvent<[player_channel: string, lobbyName: string | null, choice: Choice]>();

	onVotingClosed =
		this.registerEvent<
			[
				player_channel: string,
				lobbyName: string | null,
				result: string,
				ties: string[],
				battleChatter: string | undefined,
				battleCard: Card | undefined,
				battleCardRandom: boolean | undefined
			]
		>();

	onChoiceSelected =
		this.registerEvent<
			[
				player_channel: string,
				lobbyName: string | null,
				card: Card,
				battleChatter: string | undefined,
				battleCard: Card | undefined,
				battlerCardRandom: boolean | undefined
			]
		>();

	onDraftComplete = this.registerEvent<[draft: Draft]>();

	onDraftCanceled = this.registerEvent<[draft: Draft]>();

	onDraftFinished = this.registerEvent<[draft: Draft]>();

	onChoiceOverride =
		this.registerEvent<
			[
				player_channel: string,
				result: string,
				battleChatter: string | undefined,
				battleCard: string | undefined,
				battleCardRandom: boolean | undefined
			]
		>();

	onBattlerChoice = this.registerEvent<[player_channel: string, card: Card]>();

	/**
	 * Starts this draft. Emits the onDraftStarted event and creates a New Choice.
	 *
	 * @public
	 * @async
	 * @returns {*}
	 */
	public async StartDraft(newChoice: boolean = true) {
		if (this.started) return;
		this.started = true;
		this.startTime = DatetimeNowUtc();
		if (this.player != '') {
			this.emit(this.onDraftStarted, this.player, this.lobbyName, this.viewerName);
		}

		this.total = 0;
		if (newChoice) {
			this.currentChoice = await this.NewChoice(DatetimeNowUtc(), this.duration);
		}
		this.cards = [];
	}

	/**
	 * Cancels this draft
	 *
	 * @public
	 */
	public CancelDraft() {
		if (this.voteTimer) {
			clearTimeout(this.voteTimer);
			this.voteTimer = undefined;
		}

		this.finishTime = DatetimeNowUtc();

		if (this.total < 12 && this.player != '') {
			this.emit(this.onDraftCanceled, this);
		} else {
			this.emit(this.onDraftFinished, this);
		}
	}

	/**
	 * Creates a new choice for the draft
	 *
	 * @public
	 * @async
	 * @param {Card[]} [excluded=[]] A list of cards to exclude (cards previously selected)
	 * @returns {Promise<Choice>}
	 */
	public async NewChoice(
		roundStartTime: number,
		duration: number,
		shuffledCards: Card[] = [...shuffle(this.all_cards)]
	): Promise<Choice> {
		if (this.voteTimer) {
			clearTimeout(this.voteTimer);
			this.voteTimer = undefined;
		}

		if (shuffledCards.length < this.selections) {
			throw new Error('Not enough selectable cards to continue draft');
		}

		const voting_period_ms = (duration + this.voteTimerOffset) * seconds_to_ms; // voting period + 5 seconds after votes open

		const choices: Card[] = Array(this.selections);
		const voteCounts: number[] = Array(this.selections);

		if (this.featuredCardMode != 'off' && this.total == 0) {
			const featuredCard = await LookupCard(this.all_cards, this.featuredCardDefKey);
			if (this.featuredCardMode == 'on') {
				choices[0] = featuredCard;
				voteCounts[0] = 0;
				for (let i = 1; i < this.selections; i++) {
					choices[i] = shuffledCards.pop()!;
					voteCounts[i] = 0;
				}
			} else if (this.featuredCardMode == 'full') {
				for (let i = 0; i < this.selections; i++) {
					choices[i] = featuredCard;
					voteCounts[i] = 0;
				}
			}
		} else {
			for (let i = 0; i < this.selections; i++) {
				if (this.total < 12) {
					choices[i] = shuffledCards.pop()!;
				} else {
					const name = getRandomDeckName(this.cards);
					choices[i] = {
						cardDefKey: name,
						displayImageUrl: '',
						name: name,
						description: '',
						cost: 0
					};
				}
				voteCounts[i] = 0;
			}
		}
		const newChoice = {
			cards: choices,
			votes: new Map<string, string>(),
			voteCounts: voteCounts,
			votes_closed: roundStartTime + voting_period_ms
		};

		if (this.duration) {
			this.emit(this.onNewChoice, this.player, this.lobbyName, newChoice);
			this.voteTimer = setTimeout(async () => {
				const { winner, ties, battleCard, battleVoteRandom } = await this.CloseVoting();
				if (winner) {
					this.emit(
						this.onVotingClosed,
						this.player,
						this.lobbyName,
						winner?.name,
						ties,
						this.viewerName,
						battleCard,
						battleVoteRandom
					);
				}
			}, voting_period_ms);
		}

		if (this.viewerDeck) {
			this.battleVote = undefined;
		}

		return newChoice;
	}

	/**
	 * Closes voting, determines the winner, runs tiebreaker if any
	 *
	 * @private
	 * @returns {{ winner: Card; ties: Card[]; }}
	 */
	public async CloseVoting(createNewChoice: boolean = true) {
		let ties: Card[] = [];
		let winner = undefined;
		if (!this.currentChoice) return { winner: undefined, ties: ties };

		let highVote = 0;
		this.currentChoice.voteCounts.forEach((vote, index) => {
			if (vote > highVote) {
				if (this.currentChoice?.cards[index]) {
					highVote = vote;
					ties = [this.currentChoice?.cards[index]];
					winner = this.currentChoice?.cards[index];
				}
			} else if (vote == highVote) {
				if (this.currentChoice?.cards[index]) {
					ties.push(this.currentChoice?.cards[index]);
					winner = undefined;
				}
			}
		});

		if (!winner) {
			winner = ties[Math.floor(Math.random() * ties.length)];
		}

		const { battleVote, battleVoteRandom } = await this.Choose(
			winner.cardDefKey,
			false,
			createNewChoice
		);

		return {
			winner: winner,
			ties: ties.map((card) => card.name),
			battleCard: battleVote,
			battleVoteRandom: battleVoteRandom
		};
	}

	/**
	 * Choose a given card in the draft
	 *
	 * @public
	 * @async
	 * @param {(string | undefined | null)} cardDefKey Card chosen
	 * @param {boolean} [override=false] Whether the choice was via voting or overriden
	 * @param {Choice} [newChoice=undefined] The new choice that should be used for the
	 * next round of selection. If undefined, the default behavior is to use a list of
	 * excluded cards in the NewChoice function. This can be used so metadrafts can use
	 *  different criteria when offering choices
	 * @returns {*}
	 */
	public async Choose(
		cardDefKey: string | undefined | null,
		override: boolean = false,
		createNewChoice: boolean = true
	) {
		let battleVoteRandom = false;
		if (this.viewerName && this.battleVote) {
			this.viewerDeck.push(this.battleVote);
		} else if (this.viewerName && !this.battleVote && this.currentChoice) {
			this.battleVote =
				this.currentChoice.cards[Math.floor(Math.random() * this.currentChoice.cards.length)];
			this.viewerDeck.push(this.battleVote);
			battleVoteRandom = true;
		}
		const battleVote = this.battleVote;

		if (cardDefKey && override && this.player != '')
			this.emit(
				this.onChoiceOverride,
				this.player,
				cardDefKey,
				this.viewerName,
				battleVote?.name,
				battleVoteRandom
			);
		if (!cardDefKey) return { battleVote: undefined, battleVoteRandom: undefined };

		if (!this.CanChoose(cardDefKey)) return { battleVote: undefined, battleVoteRandom: undefined };

		this.cards.push((await this.LookupCard(cardDefKey))!);
		this.total++;

		if (this.player != '') {
			this.emit(
				this.onChoiceSelected,
				this.player,
				this.lobbyName,
				(await this.LookupCard(cardDefKey))!,
				this.viewerName,
				this.battleVote,
				battleVoteRandom
			);
		}

		if (this.total == 12) {
			this.deckName = ''; //cardDefKey;
			this.currentChoice = undefined;
			if (this.player != '') {
				this.emit(this.onDraftComplete, this);
			}
			return { battleVote: battleVote, battleVoteRandom: battleVoteRandom };
		}

		if (createNewChoice) {
			let excluded = this.cards;
			if (this.viewerName) {
				// Union of battleCards and streamer's cards
				excluded = [...new Set([...excluded, ...this.viewerDeck])];
			}
			const available = this.all_cards.filter((c) =>
				excluded.every((e) => e.cardDefKey != c.cardDefKey)
			);
			const shuffledDeck = shuffle(available);
			this.currentChoice = await this.NewChoice(DatetimeNowUtc(), this.duration, shuffledDeck);
		}

		return { battleVote: battleVote, battleVoteRandom: battleVoteRandom };
	}

	/**
	 * Returns whether the given card can be chosen in this draft
	 *
	 * @private
	 * @param {(string | undefined | null)} cardDefKey Card to be chosen
	 * @returns {boolean}
	 */
	private CanChoose(cardDefKey: string | undefined | null) {
		if (this.total == 12) return false;

		if (!cardDefKey) return false;

		const card = this.LookupCard(cardDefKey);

		if (card === undefined) return false;

		const validChoice =
			this.currentChoice && this.currentChoice.cards.some((card) => card.cardDefKey == cardDefKey);

		const alreadyDrafted = this.cards.some((c) => c.cardDefKey == cardDefKey);

		return validChoice && !alreadyDrafted;
	}

	/**
	 * Adds or updates a user's vote in the draft
	 *
	 * @public
	 * @param {string} user Twitch name of the voter
	 * @param {string} choice The card voted for
	 * @param {boolean} isSubscriber If the voter is a subscriber
	 */
	public Vote(user: string, choice: string, isSubscriber: boolean) {
		if (!this.currentChoice) return;

		let extraVotes = 0;

		if (isSubscriber && this.subsExtraVote) {
			extraVotes++;
		}

		const vote = Number(choice);
		if (vote < 1 || vote > this.selections) return;

		if (user.toLowerCase() == this.viewerName) {
			this.battleVote = this.currentChoice.cards[vote - 1];
			this.emit(this.onBattlerChoice, this.player, this.battleVote);
		} else {
			const oldVote = Number(this.currentChoice?.votes.get(user));
			if (oldVote >= 1 && oldVote <= 6) {
				this.currentChoice.voteCounts[oldVote - 1] -= 1 + extraVotes;
			}

			this.currentChoice?.votes.set(user, choice);

			this.currentChoice.voteCounts[vote - 1] += 1 + extraVotes;
		}
	}

	/**
	 * Converts this into a serializable IDraft
	 *
	 * @public
	 * @returns {IDraft}
	 */
	public toIDraft(): IDraft {
		return {
			cards: this.cards,
			total: this.total,
			player: this.player,
			currentChoice: this.currentChoice,
			duration: this.duration,
			selections: this.selections,
			deckName: this.deckName,
			viewerDeck: this.viewerDeck,
			viewerName: this.viewerName
		};
	}

	/**
	 * Gets the deck code of the finished draft.
	 *
	 * @public
	 * @returns {string}
	 */
	public GetDeckCode(): string {
		return GetDeckCode(this.cards);
	}

	/**
	 * Returns the Card for a given cardDefKey
	 *
	 * @private
	 * @param {(string | undefined | null)} cardDefKey The cardDefKey
	 * @returns {Card} The Card
	 */
	public async LookupCard(cardDefKey: string | null) {
		return LookupCard(this.all_cards, cardDefKey);
	}
}

export type Choice = {
	cards: Card[];
	votes: Map<string, string>;
	voteCounts: number[];
	votes_closed: number;
};

export enum OtdStatus {
	Unused = 'Unused',
	Started = 'Started',
	Finished = 'Finished',
	LinkExpired = 'LinkExpired',
	DraftExpired = 'DraftExpired',
	Ready = 'Ready'
}
