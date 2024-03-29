import type { Choice, Card, Deck, Draft } from "$lib/snap/draft";
import { type ExtendedGlobal, GlobalThisWSS } from "./webSocketHandler";

export function SendMessage(player_channel: string, message: string) {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss !== undefined) {
		wss.clients.forEach(client => {
            if ((client.readyState === 1) && client.player_channel == player_channel) {
                client.send(message);
            }
        });
	}
}

export const DraftStarted = async(player_channel: string) => {
    SendMessage(player_channel, 'draftstarted');
}

export const NewChoice = async (player_channel: string, choice: Choice) => {
    SendMessage(player_channel, `newchoice:${JSON.stringify(choice)}`)
}

export const ChoiceSelected = async (player_channel: string, card: Card) => {
    SendMessage(player_channel, `choiceselected:${JSON.stringify(card)}`);
}

export const DraftComplete = async (player_channel: string, deck: Deck) => {
    SendMessage(player_channel, `draftcomplete:${JSON.stringify(deck)}`);
}

export const DraftCanceled = async (draft: Draft) => {
    SendMessage(draft.player, `draftcanceled`);
}

export const VotingClosed = async (player_channel: string) => {
    SendMessage(player_channel, `votingclosed`);
}

export const ChoiceOverride = async (player_channel: string, result: string) => {
    SendMessage(player_channel, `choiceoverride:${result}`);
}

export const PreviewToggled = async(player_channel: string, previewStatus: boolean) => {
    SendMessage(player_channel, `previewtoggled:${previewStatus}`);
}

export const BrowserSourceUpdated = async(player_channel: string, full_source_configured: boolean, deck_sources_configured: boolean, choice_sources_configured: boolean) => {
    SendMessage(player_channel, `browserupdated:${JSON.stringify({full_source_configured: full_source_configured, deck_sources_configured: deck_sources_configured, choice_sources_configured: choice_sources_configured})}`);
}
