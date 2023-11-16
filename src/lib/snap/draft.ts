import * as cards from '$lib/data/cards.json';
import DraftListener from './draftListener';
import { shuffle } from './utils';

const drafts = new Map<string, Draft>();
export const Listener = new DraftListener();

export function GetDraft(player: string) {
	return drafts.get(player);
}

export function StartDraft(player: string) {
	Listener.DraftStarted(player)
	
	const newDraft: Draft = {
		total: 0,
		player: player,
		currentChoice: NewChoice(player),
		cards: []
	};

	drafts.set(player, newDraft);

	return newDraft;
}

export function CancelDraft(player: string) {
	drafts.delete(player);
	Listener.DraftCanceled(player);
}

export function NewChoice(player: string, excluded: Card[] = []): Choice {
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

	Listener.NewChoice(player, newChoice)

	return newChoice;
}

export function LookupCard(cardDefKey: string | undefined | null) {
	if (!cardDefKey) return undefined;
	return cards.all.find((card) => card.cardDefKey == cardDefKey);
}

export function Choose(draft: Draft, cardDefKey: string | undefined | null) {
	if (!cardDefKey) return;

	if (!CanChoose(draft, cardDefKey)) return;

	draft.cards.push(LookupCard(cardDefKey)!);
	draft.cards = draft.cards.sort((a, b) => {
		return a.cost - b.cost;
	});
	draft.total++;

	if (draft.total == 12) {
		draft.currentChoice = undefined;
		Listener.DraftComplete(draft.player, draft.cards);
	} else {
		draft.currentChoice = NewChoice(draft.player, draft.cards);
		Listener.NewChoice(draft.player, draft.currentChoice);
	}
}

export function CanChoose(draft: Draft, cardDefKey: string | undefined | null) {
	if (draft.total == 12) return false;

	if (!cardDefKey) return false;

	const card = LookupCard(cardDefKey);

	if (!(card)) return false;

	const validChoice =
		draft.currentChoice &&
		[
			draft.currentChoice.card1.cardDefKey,
			draft.currentChoice.card2.cardDefKey,
			draft.currentChoice.card3.cardDefKey
		].includes(card.cardDefKey);

	const alreadyDrafted = draft.cards.some((c) => c.cardDefKey == cardDefKey);

	return validChoice && !alreadyDrafted;
}

export function GetDeckCode(deck: Deck): string {
	type cardCode = { CardDefId: string }
	const obj = {Cards: Array<cardCode>()}
	deck.forEach(card => obj.Cards.push({CardDefId: card.cardDefKey}))
	return btoa(JSON.stringify(obj))
}

export function Vote(channel: string, user: string, choice: string) {
	if (!IsActive(channel)) return;

	const current_choice = drafts.get(channel)?.currentChoice

	if (!current_choice) return;

	switch (current_choice?.votes.get(user)) {
		case '1':
			current_choice.votes1--;
			break;
		case '2':
			current_choice.votes2--;
			break;
		case '3':
			current_choice.votes3--;
			break;
		default:
			// do nothing
			break;
	}

	drafts.get(channel)?.currentChoice?.votes.set(user, choice);

	switch (choice) {
		case '1':
			current_choice.votes1++;
			break;
		case '2':
			current_choice.votes2++;
			break;
		case '3':
			current_choice.votes3++;
			break;
		default:
			//shouldn't happen
			break;
	}
}

export function IsActive(channel: string) {
	return drafts.has(channel);
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

export type Draft = {
	cards: Deck;
	total: number;
	player: string;
	currentChoice: Choice | undefined;
};