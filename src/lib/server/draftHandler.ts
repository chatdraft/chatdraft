import type IDraft from '$lib/snap/draft';
import type { Choice, Draft } from '$lib/snap/draft';
import { shuffle } from '$lib/snap/utils';
import type { EventHandler } from '@d-fischer/typed-event-emitter';
import { GetAllCards } from './cardsHandler';
import { DatetimeNowUtc } from '$lib/datetime';
import type { Card, Deck } from '$lib/snap/cards';

export const drafts = new Map<string, Draft>();
export const oneTimeDrafts = new Map<string, Draft>();
export const previousDrafts = new Map<string, Draft>();

/**
 * Returns a list of currently active Drafts
 *
 * @export
 * @returns {IDraft[]} List of currently active drafts.
 */
export function GetDrafts() {
	const idrafts: IDraft[] = [];
	drafts.forEach((draft) => {
		idrafts.push(draft.toIDraft());
	});
	return idrafts;
}

/**
 * Sets the given draft to be the Previous Draft. The user is inferred from
 * the draft object.
 *
 * @export
 * @param {Draft} draft Previous draft to be set
 */
export function SetPreviousDraft(draft: Draft) {
	if (previousDrafts.get(draft.player) !== draft) {
		previousDrafts.set(draft.player, draft);
		drafts.delete(draft.player);
	}
}

/**
 * Gets a list of all previous drafts run for all users.
 *
 * @export
 * @returns {IDraft[]} List of previous drafts.
 */
export function GetPreviousDrafts() {
	const idrafts: IDraft[] = [];
	previousDrafts.forEach((draft) => {
		idrafts.push(draft.toIDraft());
	});
	return idrafts;
}

/**
 * Generates a random mid-draft state.
 *
 * @export
 * @async
 * @returns {Promise<IDraft>}
 */
export async function GetPreviewDraft(): Promise<IDraft> {
	const total = Math.floor(Math.random() * 13);

	const deck: Card[] = [];
	const shuffled: Card[] = [];
	const cards = await GetAllCards();
	cards.all.forEach((card) => shuffled.push(card));
	shuffle(shuffled);
	for (let i = 0; i < total; i++) {
		deck.push(shuffled.pop()!);
	}

	const player = 'preview';

	const duration = 60;
	const selections = 6;
	const currentChoice: Choice = {
		cards: [],
		votes: new Map<string, string>(),
		voteCounts: [],
		votes_closed: DatetimeNowUtc() + duration * 1000
	};

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
		deckName: deckName,
		viewerDeck: [],
		viewerName: undefined
	};
}

/**
 * Gets the current draft for the given player.
 *
 * @export
 * @param {string} player Twitch channel name of the draft to get
 * @returns {Draft | undefined} The player's draft
 */
export function GetDraft(player: string) {
	return drafts.get(player);
}

/**
 * Gets the previous draft for the given player.
 *
 * @export
 * @param {string} player Twitch channel name of the draft to get
 * @returns {Draft | undefined} The player's previous draft
 */
export function GetPreviousDraft(player: string) {
	return previousDrafts.get(player);
}

/**
 * Ends the current draft for the given player.
 *
 * @export
 * @param {string} player Twitch channel name of the draft to get
 * @returns {*}
 */
export function EndDraft(player: string) {
	const draft = drafts.get(player);
	if (draft) {
		if (draft.total >= 12) {
			previousDrafts.set(player, draft);
		}
		draft.CancelDraft();
		drafts.delete(player);
	}
}

/**
 * Gets the status of the draft for the given player
 *
 * @export
 * @param {string} player Twitch channel name of the draft to get
 * @returns {boolean} Whether the player has an active current draft.
 */
export function IsActive(player: string) {
	return drafts.has(player) && drafts.get(player)!.currentChoice;
}

/**
 * Sets the active draft for the given one time code.
 * @param {string} code The one time code
 * @param {Draft} draft The Draft object
 */
export function SetOneTimeDraft(code: string, draft: Draft) {
	oneTimeDrafts.set(code, draft);
}

/**
 * Gets the active draft for the given one time code.
 * @param {string} code The one time code.
 * @returns The active draft if any
 */
export function GetOneTimeDraft(code: string | null) {
	if (code && oneTimeDrafts.has(code)) return oneTimeDrafts.get(code);
}

/**
 * Clears the active draft for the given one time code.
 * @param {string} code The one time code.
 */
export function ClearOneTimeDraft(code: string | null) {
	if (code && oneTimeDrafts.has(code)) oneTimeDrafts.delete(code);
}

export type DraftEvents = {
	DraftStarted: EventHandler<[player_channel: string]>;
	DraftCanceled: EventHandler<[player_channel: string]>;
	NewChoice: EventHandler<[player_channel: string, choice: Choice]>;
	ChoiceSelected: EventHandler<
		[
			player_channel: string,
			card: Card,
			battleChatter: string | undefined,
			battleCard: Card | undefined,
			battlerCardRandom: boolean | undefined
		]
	>;
	DraftComplete: EventHandler<[player_channel: string, deck: Deck]>;
	VotingClosed: EventHandler<[player_channel: string, result: string, ties: string[]]>;
	ChoiceOverride: EventHandler<[player_channel: string, result: string]>;
};
