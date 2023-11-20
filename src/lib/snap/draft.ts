import * as cards from '$lib/data/cards.json';
import { EventEmitter, type EventHandler } from '@d-fischer/typed-event-emitter';
import { shuffle } from './utils';

const drafts = new Map<string, Draft>();

export function GetDraft(player: string) {
	return drafts.get(player);
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

export default class Draft extends EventEmitter {
	public cards: Deck = [];
	public total: number = 0;
	public player: string = '';
	public currentChoice: Choice | undefined;
	private voteTimer: NodeJS.Timeout | undefined;

	private voting_period_s = 20;

	public constructor(draftEvents: DraftEvents, duration: number) {
		super();
		this.voting_period_s = duration;
		this.onDraftStarted(draftEvents.DraftStarted);
		this.onDraftCanceled(draftEvents.DraftCanceled);
		this.onNewChoice(async (player_channel, choice) => {
			// delay 5 seconds before announcing a new choice for the stream to update
			await new Promise(f => setTimeout(f, 5000));
			draftEvents.NewChoice(player_channel, choice);
		});
		this.onChoiceSelected(draftEvents.ChoiceSelected);
		this.onDraftComplete(async (player_channel, deck) => {
			await new Promise(f=> setTimeout(f,6000));
			draftEvents.DraftComplete(player_channel, deck)
			await new Promise(f=> setTimeout(f,this.voting_period_s*2*1000))
			this.CancelDraft();
		});
		this.onVotingClosed(draftEvents.VotingClosed)
		this.onChoiceOverride(draftEvents.ChoiceOverride)
	}

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
	}

	public NewChoice(excluded: Card[] = []): Choice {
		if (this.voteTimer) {
			clearTimeout(this.voteTimer);
			this.voteTimer = undefined;
		}

		const available = cards.all.filter((c) => excluded.every((e) => e.cardDefKey != c.cardDefKey));
	
		if (available.length < 3) {
			throw new Error('Not enough selectable cards to continue draft');
		}

		const voting_period_ms = (this.voting_period_s + 5) * 1000;
	
		const deck = shuffle(available);
		const newChoice = {
			card1: deck.pop()!,
			card2: deck.pop()!,
			card3: deck.pop()!,
			votes: new Map<string, string>(),
			votes1: 0,
			votes2: 0,
			votes3: 0,
			votes_closed: Date.now() + voting_period_ms, // voting period + 5 seconds after votes open
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


		if ((this.currentChoice?.votes1 > this.currentChoice?.votes2) &&
			((this.currentChoice?.votes1 > this.currentChoice?.votes3))) {
				winner = this.currentChoice?.card1;
		}
		if ((this.currentChoice?.votes2 > this.currentChoice?.votes1) &&
			((this.currentChoice?.votes2 > this.currentChoice?.votes3))) {
				winner = this.currentChoice?.card2;
		}
		if ((this.currentChoice?.votes3 > this.currentChoice?.votes2) &&
			((this.currentChoice?.votes3 > this.currentChoice?.votes1))) {
				winner = this.currentChoice?.card3;
		}

		if (!winner) {
			if ((this.currentChoice.votes1 == this.currentChoice.votes2) &&
				(this.currentChoice.votes1 == this.currentChoice.votes3)) {
					ties = [this.currentChoice.card1, this.currentChoice.card2, this.currentChoice.card3]
			}
			else if ((this.currentChoice.votes1 == this.currentChoice.votes2)) {
				ties = [this.currentChoice.card1, this.currentChoice.card2]
			}
			else if ((this.currentChoice.votes1 == this.currentChoice.votes3)) {
				ties = [this.currentChoice.card1, this.currentChoice.card3]
			}
			
			else {
				ties = [this.currentChoice.card2, this.currentChoice.card3]
			}
			
			winner = ties[Math.floor(Math.random() * ties.length)]
		}
		
		this.Choose(winner.cardDefKey)

		return { winner: winner, ties: ties.map((card) => card.cardDefKey) };
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
	votes_closed: number;
};