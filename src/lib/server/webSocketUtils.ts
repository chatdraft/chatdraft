import { DatetimeNowUtc } from '$lib/datetime';
import type { Card, Deck } from '$lib/snap/cards';
import type { Choice, Draft } from '$lib/snap/draft';
import { WebSocketMessageType, type WebSocketMessage } from '$lib/websocket';
import { type ExtendedGlobal, GlobalThisWSS } from './webSocketHandler';

/**
 * Sends a message to all websockets associated with the given twitch user channel
 *
 * @export
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {WebSocketMessage} message The message to send
 */
export function SendMessageToPlayerChannel(player_channel: string, message: WebSocketMessage) {
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
 * Sends a message to all websockets associated with the given twitch user channel
 *
 * @export
 * @param {string} lobby The cube draft lobby to send the message to
 * @param {WebSocketMessage} message The message to send
 */
export function SendMessageToLobby(lobbyName: string | null, message: WebSocketMessage) {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss !== undefined) {
		wss.clients.forEach((client) => {
			if (client.readyState === 1 && client.lobbyName == lobbyName) {
				client.send(JSON.stringify(message));
			}
		});
	}
}

/**
 * Sends a message to all websockets associated with the given twitch user channel
 *
 * @export
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {WebSocketMessage} message The message to send
 */
export function SendMessageToPlayerInLobby(
	player_channel: string,
	lobbyName: string,
	message: WebSocketMessage
) {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss !== undefined) {
		wss.clients.forEach((client) => {
			if (
				client.readyState === 1 &&
				client.player_channel == player_channel &&
				client.lobbyName == lobbyName
			) {
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
export const DraftStarted = async (player_channel: string, lobbyName: string | null = null) => {
	const wsm = {
		type: WebSocketMessageType.DraftStarted,
		timestamp: DatetimeNowUtc()
	};

	if (!lobbyName) {
		SendMessageToPlayerChannel(player_channel, wsm);
	} else {
		SendMessageToLobby(lobbyName, wsm);
	}
};

/**
 * Sends the NewChoice message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {string | null} lobbyName The cube draft lobby this draft is related to
 * @param {Choice} choice The updated choice
 * @returns {*}
 */
export const NewChoice = async (
	player_channel: string,
	lobbyName: string | null = null,
	choice: Choice
) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.NewChoice,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify(choice)
	};
	if (!lobbyName) {
		SendMessageToPlayerChannel(player_channel, wsm);
	} else {
		SendMessageToPlayerInLobby(player_channel, lobbyName, wsm);
	}
};

/**
 * Sends the ChoiceSelected message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {string | null} lobbyName The cube draft lobby this draft is related to
 * @param {Card} card The card that was selected
 * @returns {*}
 */
export const ChoiceSelected = async (
	player_channel: string,
	lobbyName: string | null = null,
	card: Card
) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.ChoiceSelected,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify(card)
	};
	if (!lobbyName) {
		SendMessageToPlayerChannel(player_channel, wsm);
	} else {
		SendMessageToPlayerInLobby(player_channel, lobbyName, wsm);
	}
};

/**
 * Sends the DraftComplete message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @param {string | null} lobbyName The cube draft lobby this draft is related to
 * @param {Deck} deck The finish drafted deck
 * @returns {*}
 */
export const DraftComplete = async (
	player_channel: string,
	lobbyName: string | null = null,
	deck: Deck
) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.DraftComplete,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify(deck)
	};
	if (!lobbyName) {
		SendMessageToPlayerChannel(player_channel, wsm);
	} else {
		SendMessageToPlayerInLobby(player_channel, lobbyName, wsm);
	}
};

/**
 * Sends the DraftCanceled message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @returns {*}
 */
export const DraftCanceled = async (draft: Draft) => {
	const wsm = {
		type: WebSocketMessageType.DraftCanceled,
		timestamp: DatetimeNowUtc()
	};
	if (!draft.lobbyName) {
		SendMessageToPlayerChannel(draft.player, wsm);
	} else {
		SendMessageToPlayerInLobby(draft.player, draft.lobbyName, wsm);
	}
};

/**
 * Sends the VotingClosed message to websockets associated with the given player channel
 *
 * @async
 * @param {string} player_channel The Twitch channel to send the websocket message to
 * @returns {*}
 */
export const VotingClosed = async (player_channel: string, lobbyName: string | null = null) => {
	const wsm = {
		type: WebSocketMessageType.VotingClosed,
		timestamp: DatetimeNowUtc()
	};
	if (!lobbyName) {
		SendMessageToPlayerChannel(player_channel, wsm);
	} else {
		SendMessageToPlayerInLobby(player_channel, lobbyName, wsm);
	}
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
	SendMessageToPlayerChannel(player_channel, wsm);
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
	SendMessageToPlayerChannel(player_channel, wsm);
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
	SendMessageToPlayerChannel(player_channel, wsm);
};

export const BattlerChoice = async (player_channel: string, battlerChoiceCard: Card) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.BattlerSelected,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify(battlerChoiceCard)
	};
	SendMessageToPlayerChannel(player_channel, wsm);
};

export const LobbyDraftPoolUpdated = async (lobbyName: string | null) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.LobbyDraftPoolUpdated,
		timestamp: DatetimeNowUtc()
	};
	SendMessageToLobby(lobbyName, wsm);
};

export const LobbyDraftRoundOver = async (lobbyName: string) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.LobbyDraftRoundOver,
		timestamp: DatetimeNowUtc()
	};
	SendMessageToLobby(lobbyName, wsm);
};

export const LobbyDraftComplete = async (lobbyName: string) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.LobbyDraftComplete,
		timestamp: DatetimeNowUtc()
	};
	SendMessageToLobby(lobbyName, wsm);
};

export const LobbyUpdated = async (lobbyName: string) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.LobbyUpdated,
		timestamp: DatetimeNowUtc()
	};
	SendMessageToLobby(lobbyName, wsm);
};

export const LobbyClosed = async (lobbyName: string) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.LobbyClosed,
		timestamp: DatetimeNowUtc()
	};
	SendMessageToLobby(lobbyName, wsm);
};

export const LobbyLockInUpdated = async (
	lobbyName: string,
	lockInRoundEndsAt: number | undefined
) => {
	const wsm: WebSocketMessage = {
		type: WebSocketMessageType.LobbyLockInUpdated,
		timestamp: DatetimeNowUtc(),
		message: JSON.stringify(lockInRoundEndsAt)
	};
	SendMessageToLobby(lobbyName, wsm);
};
