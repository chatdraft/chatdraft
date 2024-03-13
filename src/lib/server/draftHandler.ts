import type IDraft from "$lib/snap/draft";
import type { Card, Choice, Deck, Draft } from "$lib/snap/draft";
import { shuffle } from "$lib/snap/utils";
import type { EventHandler } from '@d-fischer/typed-event-emitter';
import { GetAllCards } from "./cardsHandler";

export const drafts = new Map<string, Draft>();
export const previousDrafts = new Map<string, Draft>();

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

export async function GetPreviewDraft(): Promise<IDraft> {
	const total = Math.floor( Math.random() * 13 )

	const deck: Card[] = [];
	const shuffled: Card[] = [];
	const cards = await GetAllCards();
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
	return previousDrafts.get(player);
}

export function EndDraft(player: string) {
    const draft = drafts.get(player);
    if (draft) {
        draft.CancelDraft();
		drafts.delete(player);
    }
}

export function IsActive(player: string) {
    return (drafts.has(player) && drafts.get(player)!.currentChoice);
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