import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { shuffle } from './utils';
import { getRandomDeckName } from './draftNames';
import { DatetimeNowUtc } from '$lib/datetime';


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

	public duration = 20;
	public selections = 3;

	
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
	 * @param {(string[] | null)} collection The users available collection.
	 */
	public constructor(player_channel: string, duration: number, selections: number, all_cards: {all: {cardDefKey: string, variantKey: null, url: string, name: string, description: string, displayImageUrl: string, cost: number}[]}, subsExtraVote = false, collection: string[] | null) {
		super();
		this.player = player_channel;
		this.duration = duration;
		this.selections = selections;
		this.subsExtraVote = subsExtraVote;
		this.all_cards = all_cards.all;

		if (collection) {
			this.all_cards = all_cards.all.filter(card => collection.includes(card.cardDefKey));
		}
	}
	cards: Deck = [];
	total: number = 0;
	player: string = '';
	currentChoice: Choice | undefined;
	subsExtraVote: boolean = false;
	all_cards: {cardDefKey: string, variantKey: null, url: string, name: string, description: string, displayImageUrl: string, cost: number}[];
	started: boolean = false;

    onDraftStarted = this.registerEvent<[player_channel: string]>();

    onNewChoice = this.registerEvent<[player_channel: string, choice: Choice]>();

	onVotingClosed = this.registerEvent<[player_channel: string, result: string, ties: string[]]>()

    onChoiceSelected = this.registerEvent<[player_channel: string, card: Card]>();

    onDraftComplete = this.registerEvent<[draft: Draft]>();

    onDraftCanceled = this.registerEvent<[draft: Draft]>();

    onDraftFinished = this.registerEvent<[draft: Draft]>();

	onChoiceOverride = this.registerEvent<[player_channel: string, result: string]>();


	/**
	 * Starts this draft. Emits the onDraftStarted event and creates a New Choice.
	 *
	 * @public
	 * @async
	 * @returns {*}
	 */
	public async StartDraft() {
		if (this.started) return;
		this.started = true;
		if (this.player != '') {
        	this.emit(this.onDraftStarted, this.player)
		}
	
		this.total = 0;
		this.currentChoice = await this.NewChoice(),
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

		if (this.total < 12 && this.player != '') {
			this.emit(this.onDraftCanceled, this);
		}
		else {
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
	public async NewChoice(excluded: Card[] = []): Promise<Choice> {
		if (this.voteTimer) {
			clearTimeout(this.voteTimer);
			this.voteTimer = undefined;
		}

		const available = this.all_cards.filter((c) => excluded.every((e) => e.cardDefKey != c.cardDefKey));
	
		if (available.length < this.selections) {
			throw new Error('Not enough selectable cards to continue draft');
		}

		const voting_period_ms = (this.duration + 5) * 1000; // voting period + 5 seconds after votes open
	
		const deck = shuffle(available);
		const choices : Card[] = Array(this.selections);
		const voteCounts : number[] = Array(this.selections);

		for (let i = 0; i < this.selections; i++) {
			if (this.total < 12) {
				choices[i] = deck.pop()!;
			}
			else {
				const name = getRandomDeckName(this.cards)
				choices[i] = {
					cardDefKey: name,
					displayImageUrl: '',
					name: name,
					description: '',
					cost: 0
				}
			}
			voteCounts[i] = 0;
		}
		const newChoice = {
			cards: choices,
			votes: new Map<string, string>(),
			voteCounts: voteCounts,
			votes_closed: DatetimeNowUtc() + voting_period_ms,
		};
	
		if (this.player != '') {
			this.emit(this.onNewChoice, this.player, newChoice);
			this.voteTimer = setTimeout(() => {
				const result = this.CloseVoting();
				if (result && result.winner) {
					this.emit(this.onVotingClosed, this.player, result.winner?.name, result.ties)
				}
			}, voting_period_ms);
		}
	
		return newChoice;
	}

	
	/**
	 * Closes voting, determines the winner, runs tiebreaker if any
	 *
	 * @private
	 * @returns {{ winner: any; ties: any; }}
	 */
	private CloseVoting() {
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
			}
			else if (vote == highVote) {
				if (this.currentChoice?.cards[index]) {
					ties.push(this.currentChoice?.cards[index])
					winner = undefined;
				}
			}
		})

		if (!winner) {
			winner = ties[Math.floor(Math.random() * ties.length)]
		}
		
		this.Choose(winner.cardDefKey)

		return { winner: winner, ties: ties.map((card) => card.name) };
	}

	
	/**
	 * Choose a given card in the draft
	 *
	 * @public
	 * @async
	 * @param {(string | undefined | null)} cardDefKey Card chosen
	 * @param {boolean} [override=false] Whether the choice was via voting or overriden
	 * @returns {*}
	 */
	public async Choose(cardDefKey: string | undefined | null, override: boolean = false) {
		if (override && this.player != '') this.emit(this.onChoiceOverride, this.player, cardDefKey);
		if (!cardDefKey) return;

		if (!this.CanChoose(cardDefKey)) return;

		this.cards.push((await this.LookupCard(cardDefKey))!);
		this.cards = this.cards.sort((a, b) => {
			return a.cost - b.cost;
		});
		this.total++;

		if (this.player != '') {
			this.emit(this.onChoiceSelected, this.player, (await this.LookupCard(cardDefKey))!)
		}

		if (this.total == 12) {
			this.deckName = ''; //cardDefKey;
			this.currentChoice = undefined;
			if (this.player != '') {
				this.emit(this.onDraftComplete, this);
			}
			return;
		}

		
		this.currentChoice = await this.NewChoice(this.cards);
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
	
		if (!(card)) return false;
	
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
		if ((vote < 1) || (vote > this.selections)) return;

		const oldVote = Number(this.currentChoice?.votes.get(user));
		if ((oldVote >= 1) && (oldVote <= 6)) {
			this.currentChoice.voteCounts[oldVote - 1]-= 1 + extraVotes;
		}

		this.currentChoice?.votes.set(user, choice);

		this.currentChoice.voteCounts[vote - 1]+= 1 + extraVotes;
	}

	
	/**
	 * Returns the Card for a given cardDefKey
	 *
	 * @private
	 * @param {(string | undefined | null)} cardDefKey The cardDefKey
	 * @returns {Card} The Card
	 */
	private LookupCard(cardDefKey: string | undefined | null) {
		if (!cardDefKey) return undefined;
		return this.all_cards.find((card) => card.cardDefKey == cardDefKey);
	}
	
	
	/**
	 * Converts this into a serializable IDraft
	 *
	 * @public
	 * @returns {IDraft}
	 */
	public toIDraft(): IDraft {
		return ({
			cards: this.cards,
			total: this.total,
			player: this.player,
			currentChoice: this.currentChoice,
			duration: this.duration,
			selections: this.selections,
			deckName: this.deckName,
		});
	}

	
	/**
	 * Gets the deck code of the finished draft.
	 *
	 * @public
	 * @returns {string}
	 */
	public GetDeckCode(): string {
		type cardCode = { CardDefId: string }
		const obj = {Cards: Array<cardCode>()}
		this.cards.forEach(card => obj.Cards.push({CardDefId: card.cardDefKey}))
		return btoa(JSON.stringify(obj))
	}
}

export type Card = {
	cardDefKey: string;
	displayImageUrl: string;
	name: string;
	description: string;
	cost: number;
};

export type Deck = Card[];

export type Choice = {
	cards: Card[];
	votes: Map<string, string>;
	voteCounts: number[];
	votes_closed: number;
};