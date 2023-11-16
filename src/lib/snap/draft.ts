import * as cards from '$lib/data/cards.json';
import { EventEmitter } from '@d-fischer/typed-event-emitter';
import { shuffle } from './utils';

const drafts = new Map<string, Draft>();

export function GetDraft(player: string) {
	return drafts.get(player);
}

export default class Draft extends EventEmitter {
	public cards: Deck = [];
	public total: number = 0;
	public player: string = '';
	public currentChoice: Choice | undefined;

	public constructor() {
		super();
	}

    onDraftStarted = this.registerEvent<[player_channel: string]>();

    onNewChoice = this.registerEvent<[player_channel: string, choice: Choice]>();

    onChoiceSelected = this.registerEvent<[player_channel: string, card: Card]>();

    onDraftComplete = this.registerEvent<[player_channel: string, deck: Deck]>();

    onDraftCanceled = this.registerEvent<[player_channel: string]>();


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
		this.emit(this.onDraftCanceled, this.player);
	}

	public NewChoice(excluded: Card[] = []): Choice {
		const available = cards.all.filter((c) => excluded.every((e) => e.cardDefKey != c.cardDefKey));
	
		if (available.length < 3) {
			throw new Error('Not enough selectable cards to continue draft');
		}
	
		const deck = shuffle(available);
		const newChoice = {
			card1: deck.pop()!,
			card2: deck.pop()!,
			card3: deck.pop()!,
			votes: new Map<string, string>(),
			votes1: 0,
			votes2: 0,
			votes3: 0
		};
	
		this.emit(this.onNewChoice, this.player, newChoice);
	
		return newChoice;
	}

	public Choose(cardDefKey: string | undefined | null) {
		if (!cardDefKey) return;

		if (!this.CanChoose(cardDefKey)) return;

		this.cards.push(Draft.LookupCard(cardDefKey)!);
		this.cards = this.cards.sort((a, b) => {
			return a.cost - b.cost;
		});
		this.total++;

		if (this.total == 12) {
			this.currentChoice = undefined;
			this.emit(this.onDraftComplete, this.player, this.cards);
		} else {
			this.currentChoice = this.NewChoice(this.cards);
		}
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
			this.currentChoice &&
			[
				this.currentChoice.card1.cardDefKey,
				this.currentChoice.card2.cardDefKey,
				this.currentChoice.card3.cardDefKey
			].includes(card.cardDefKey);
	
		const alreadyDrafted = this.cards.some((c) => c.cardDefKey == cardDefKey);
	
		return validChoice && !alreadyDrafted;
	}



	public static GetDeckCode(deck: Deck): string {
		type cardCode = { CardDefId: string }
		const obj = {Cards: Array<cardCode>()}
		deck.forEach(card => obj.Cards.push({CardDefId: card.cardDefKey}))
		return btoa(JSON.stringify(obj))
	}


	public Vote(user: string, choice: string) {
		if (!this.IsActive()) return;

		if (!this.currentChoice) return;

		switch (this.currentChoice?.votes.get(user)) {
			case '1':
				this.currentChoice.votes1--;
				break;
			case '2':
				this.currentChoice.votes2--;
				break;
			case '3':
				this.currentChoice.votes3--;
				break;
			default:
				// do nothing
				break;
		}

		drafts.get(this.player)?.currentChoice?.votes.set(user, choice);

		switch (choice) {
			case '1':
				this.currentChoice.votes1++;
				break;
			case '2':
				this.currentChoice.votes2++;
				break;
			case '3':
				this.currentChoice.votes3++;
				break;
			default:
				//shouldn't happen
				break;
		}
	}


	public IsActive() {
		return (drafts.has(this.player) && this.currentChoice);
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
	card1: Card;
	card2: Card;
	card3: Card;
	votes: Map<string, string>;
	votes1: number;
	votes2: number;
	votes3: number;
};