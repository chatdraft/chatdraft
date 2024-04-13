import { DatetimeNowUtc } from "$lib/datetime";
import type { Choice, Card, Deck, Draft } from "$lib/snap/draft";
import { WebSocketMessageType, type WebSocketMessage } from "$lib/websocket";
import { type ExtendedGlobal, GlobalThisWSS } from "./webSocketHandler";

export function SendMessage(player_channel: string, message: WebSocketMessage) {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss !== undefined) {
		wss.clients.forEach(client => {
            if ((client.readyState === 1) && client.player_channel == player_channel) {
                client.send(JSON.stringify(message));
            }
        });
	}
}

export const DraftStarted = async(player_channel: string) => {
    SendMessage(player_channel, {type: WebSocketMessageType.DraftStarted, timestamp: DatetimeNowUtc()});
}

export const NewChoice = async (player_channel: string, choice: Choice) => {
    const wsm : WebSocketMessage = {
        type: WebSocketMessageType.NewChoice,
        timestamp: DatetimeNowUtc(),
        message: JSON.stringify(choice)
    }
    SendMessage(player_channel, wsm);
}

export const ChoiceSelected = async (player_channel: string, card: Card) => {
    const wsm : WebSocketMessage = {
        type: WebSocketMessageType.ChoiceSelected,
        timestamp: DatetimeNowUtc(),
        message: JSON.stringify(card)
    }
    SendMessage(player_channel, wsm);
}

export const DraftComplete = async (player_channel: string, deck: Deck) => {
    const wsm : WebSocketMessage = {
        type: WebSocketMessageType.DraftComplete,
        timestamp: DatetimeNowUtc(),
        message: JSON.stringify(deck)
    }
    SendMessage(player_channel, wsm);
}

export const DraftCanceled = async (draft: Draft) => {
    SendMessage(draft.player, {type: WebSocketMessageType.DraftCanceled, timestamp: DatetimeNowUtc()});
}

export const VotingClosed = async (player_channel: string) => {
    SendMessage(player_channel, {type: WebSocketMessageType.VotingClosed, timestamp: DatetimeNowUtc()});
}

export const ChoiceOverride = async (player_channel: string, result: string) => {
    const wsm : WebSocketMessage = {
        type: WebSocketMessageType.ChoiceOverride,
        timestamp: DatetimeNowUtc(),
        message: result
    }
    SendMessage(player_channel, wsm);
}

export const PreviewToggled = async(player_channel: string, previewStatus: boolean) => {
    const wsm : WebSocketMessage = {
        type: WebSocketMessageType.PreviewToggled,
        timestamp: DatetimeNowUtc(),
        message: JSON.stringify(previewStatus)
    }
    SendMessage(player_channel, wsm);
}

export const BrowserSourceUpdated = async(player_channel: string, full_source_configured: boolean, deck_sources_configured: boolean, choice_sources_configured: boolean) => {
    const wsm : WebSocketMessage = {
        type: WebSocketMessageType.BrowserUpdated,
        timestamp: DatetimeNowUtc(),
        message: JSON.stringify({full_source_configured: full_source_configured, deck_sources_configured: deck_sources_configured, choice_sources_configured: choice_sources_configured})
    }
    SendMessage(player_channel, wsm);
}
