import * as cards from '$lib/data/cards.json';
import { EventEmitter, type EventHandler } from '@d-fischer/typed-event-emitter';
import { shuffle } from './utils';
import { getRandomDeckName } from './draftNames';

const drafts = new Map<string, Draft>();
const previousDrafts = new Map<string, Draft>();

export function GetDrafts() {
	const idrafts: IDraft[] = [];
	drafts.forEach((draft => {
		idrafts.push(draft.toIDraft())
	}));
	return idrafts;
}

export function GetPreviousDrafts() {
	const idrafts: IDraft[] = [];
	previousDrafts.forEach((draft => {
		idrafts.push(draft.toIDraft());
	}))
	return idrafts;
}

export function GetPreviewDraft(): IDraft {
	const total = Math.floor( Math.random() * 13 )

	const deck: Card[] = [];
	const shuffled: Card[] = [];
	cards.all.forEach(card => shuffled.push(card));
	shuffle(shuffled);
	for(let i = 0; i < total; i++) {
		deck.push(shuffled.pop()!)
	}

	const player = 'preview';

	const duration = 60;
	const selections = 6
	const currentChoice: Choice = {
		cards: [],
		votes: new Map<string, string>(),
		voteCounts: [],
		votes_closed: Date.now() + duration * 1000,
	}

	for (let i = 0; i < selections; i++) {
		currentChoice.cards.push(shuffled.pop()!);
		currentChoice.voteCounts.push(0);
	}
	const deckName = 'Preview';

	return {
		total: total,
		cards: deck,
		player: player,
		currentChoice: currentChoice,
		duration: duration,
		selections: selections,
		deckName: deckName
	}
}

export function GetDraft(player: string) {
	return drafts.get(player);
}

export function GetPreviousDraft(player: string) {
	return previousDrafts.get(player) as IDraft;
}

export function GetDeckCode(deck: Deck): string {
	type cardCode = { CardDefId: string }
	const obj = {Cards: Array<cardCode>()}
	deck.forEach(card => obj.Cards.push({CardDefId: card.cardDefKey}))
	return btoa(JSON.stringify(obj))
}

export type DraftEvents = {
	DraftStarted: EventHandler<[player_channel: string]>;
	DraftCanceled: EventHandler<[player_channel: string]>;
	NewChoice: EventHandler<[player_channel: string, choice: Choice]>;
	ChoiceSelected: EventHandler<[player_channel: string, card: Card]>;
	DraftComplete: EventHandler<[player_channel: string, deck: Deck]>;
	VotingClosed: EventHandler<[player_channel: string, result: string, ties: string[]]>;
	ChoiceOverride: EventHandler<[player_channel: string, result: string]>;
}

export default interface IDraft {
	cards: Deck;
	total: number;
	player: string;
	currentChoice: Choice | undefined;
	duration: number;
	selections: number;
	deckName: string;
}

export class Draft extends EventEmitter implements IDraft {
	
	private voteTimer: NodeJS.Timeout | undefined;
	public deckName: string = '';

	public duration = 20;
	public selections = 3;

	public constructor(duration: number, selections: number) {
		super();
		this.duration = duration;
		this.selections = selections;
	}
	cards: Deck = [];
	total: number = 0;
	player: string = '';
	currentChoice: Choice | undefined;

    onDraftStarted = this.registerEvent<[player_channel: string]>();

    onNewChoice = this.registerEvent<[player_channel: string, choice: Choice]>();

	onVotingClosed = this.registerEvent<[player_channel: string, result: string, ties: string[]]>()

    onChoiceSelected = this.registerEvent<[player_channel: string, card: Card]>();

    onDraftComplete = this.registerEvent<[player_channel: string, deck: Deck]>();

    onDraftCanceled = this.registerEvent<[player_channel: string]>();

	onChoiceOverride = this.registerEvent<[player_channel: string, result: string]>();


	public StartDraft(player: string) {
        this.emit(this.onDraftStarted, player)
	
		this.total = 0;
		this.player = player;
		this.currentChoice = this.NewChoice(),
		this.cards = []
	
		drafts.set(player, this);
	}

	public CancelDraft() {
		drafts.delete(this.player);

		if (this.voteTimer) {
			clearTimeout(this.voteTimer);
			this.voteTimer = undefined;
		}

		if (this.total < 12) {
			this.emit(this.onDraftCanceled, this.player);
		}
		else {
			previousDrafts.set(this.player, this)
		}
	}

	public NewChoice(excluded: Card[] = []): Choice {
		if (this.voteTimer) {
			clearTimeout(this.voteTimer);
			this.voteTimer = undefined;
		}

		const available = cards.all.filter((c) => excluded.every((e) => e.cardDefKey != c.cardDefKey));
	
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
			votes_closed: Date.now() + voting_period_ms,
		};
	
		this.emit(this.onNewChoice, this.player, newChoice);
		this.voteTimer = setTimeout(() => {
			const result = this.CloseVoting();
			if (result && result.winner) {
				this.emit(this.onVotingClosed, this.player, result.winner?.name, result.ties)
			}
		}, voting_period_ms);
	
		return newChoice;
	}

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

	public Choose(cardDefKey: string | undefined | null, override: boolean = false) {
		if (override) this.emit(this.onChoiceOverride, this.player, cardDefKey);
		if (!cardDefKey) return;

		if (!this.CanChoose(cardDefKey)) return;

		this.cards.push(Draft.LookupCard(cardDefKey)!);
		this.cards = this.cards.sort((a, b) => {
			return a.cost - b.cost;
		});
		this.total++;

		this.emit(this.onChoiceSelected, this.player, Draft.LookupCard(cardDefKey)!)

		if (this.total == 12) {
			this.deckName = ''; //cardDefKey;
			this.currentChoice = undefined;
			this.emit(this.onDraftComplete, this.player, this.cards);
			return;
		}

		
		this.currentChoice = this.NewChoice(this.cards);
	}

	private static LookupCard(cardDefKey: string | undefined | null) {
		if (!cardDefKey) return undefined;
		return cards.all.find((card) => card.cardDefKey == cardDefKey);
	}
	
	private CanChoose(cardDefKey: string | undefined | null) {
		if (this.total == 12) return false;
	
		if (!cardDefKey) return false;
	
		const card = Draft.LookupCard(cardDefKey);
	
		if (!(card)) return false;
	
		const validChoice =
			this.currentChoice && this.currentChoice.cards.some((card) => card.cardDefKey == cardDefKey);
	
		const alreadyDrafted = this.cards.some((c) => c.cardDefKey == cardDefKey);
	
		return validChoice && !alreadyDrafted;
	}


	public Vote(user: string, choice: string) {
		if (!this.IsActive()) return;

		if (!this.currentChoice) return;

		const vote = Number(choice);
		if ((vote < 1) || (vote > this.selections)) return;

		const oldVote = Number(this.currentChoice?.votes.get(user));
		if ((oldVote >= 1) && (oldVote <= 6)) {
			this.currentChoice.voteCounts[oldVote - 1]--;
		}

		drafts.get(this.player)?.currentChoice?.votes.set(user, choice);

		this.currentChoice.voteCounts[vote - 1]++;
	}


	public IsActive() {
		return (drafts.has(this.player) && this.currentChoice);
	}
	
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