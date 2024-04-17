import { DatetimeNowUtc } from '$lib/datetime';
import type { Choice, Card, Deck, Draft } from '$lib/snap/draft';
import { WebSocketMessageType, type WebSocketMessage } from '$lib/websocket';
import { type ExtendedGlobal, GlobalThisWSS } from './webSocketHandler';

/**
 * Sends a message to all websockets associated with the given twitch user channel
 *
 * @export
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {WebSocketMessage} message The message to send
 */
export function SendMessage(player_channel: string, message: WebSocketMessage) {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss !== undefined) {
		wss.clients.forEach((client) => {
			if (client.readyState === 1 && client.player_channel == player_channel) {
				client.send(JSON.stringify(message));
			}
		});
	}
}

/**
 * Sends the DraftStarted message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @returns {*}
 */
export const DraftStarted = async (player_channel: string) => {
	SendMessage(player_channel, {
		type: WebSocketMessageType.DraftStarted,
		timestamp: DatetimeNowUtc()
	});
};

/**
 * Sends the NewChoice message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {Choice} choice The updated choice
 * @returns {*}
 */
export const NewChoice = async (player_channel: string, choice: Choice) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.NewChoice,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify(choice)
	};
	SendMessage(player_channel, wsm);
};

/**
 * Sends the ChoiceSelected message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {Card} card The card that was selected
 * @returns {*}
 */
export const ChoiceSelected = async (player_channel: string, card: Card) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.ChoiceSelected,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify(card)
	};
	SendMessage(player_channel, wsm);
};

/**
 * Sends the DraftComplete message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {Deck} deck The finish drafted deck
 * @returns {*}
 */
export const DraftComplete = async (player_channel: string, deck: Deck) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.DraftComplete,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify(deck)
	};
	SendMessage(player_channel, wsm);
};

/**
 * Sends the DraftCanceled message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @returns {*}
 */
export const DraftCanceled = async (draft: Draft) => {
	SendMessage(draft.player, {
		type: WebSocketMessageType.DraftCanceled,
		timestamp: DatetimeNowUtc()
	});
};

/**
 * Sends the VotingClosed message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @returns {*}
 */
export const VotingClosed = async (player_channel: string) => {
	SendMessage(player_channel, {
		type: WebSocketMessageType.VotingClosed,
		timestamp: DatetimeNowUtc()
	});
};

/**
 * Sends the ChoiceOverride message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {string} result The chosen card's cardDefId
 * @returns {*}
 */
export const ChoiceOverride = async (player_channel: string, result: string) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.ChoiceOverride,
		timestamp: DatetimeNowUtc(),
		message: result
	};
	SendMessage(player_channel, wsm);
};

/**
 * Sends the PreviewToggled message to all websockets associated with the player's channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {boolean} previewStatus The current preview mode status
 * @returns {*}
 */
export const PreviewToggled = async (player_channel: string, previewStatus: boolean) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.PreviewToggled,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify(previewStatus)
	};
	SendMessage(player_channel, wsm);
};

/**
 * Sends the BrowserSourceUpdated message to all websockets associated with the twitch channel.
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {boolean} full_source_configured Whether a full source is configured
 * @param {boolean} deck_sources_configured Whether a deck source is configured
 * @param {boolean} choice_sources_configured Whether a choices source is configured
 * @returns {*}
 */
export const BrowserSourceUpdated = async (
	player_channel: string,
	full_source_configured: boolean,
	deck_sources_configured: boolean,
	choice_sources_configured: boolean
) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.BrowserUpdated,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify({
			full_source_configured: full_source_configured,
			deck_sources_configured: deck_sources_configured,
			choice_sources_configured: choice_sources_configured
		})
	};
	SendMessage(player_channel, wsm);
};
