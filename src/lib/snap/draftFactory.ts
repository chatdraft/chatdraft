import { GetAllCards } from "$lib/server/cardsHandler";
import { drafts } from "$lib/server/draftHandler";
import { ClearPreviewStatus } from "$lib/server/previewHandler";
import TwitchBot from "$lib/server/twitchBot";
import { ChoiceOverride, ChoiceSelected, DraftCanceled, DraftComplete, DraftStarted, NewChoice, VotingClosed } from "$lib/server/webSocketUtils";
import { Draft } from "./draft";

export default class DraftFactory {
    public static async CreateDraft(player_channel: string, duration: number, selections: number, subsExtraVote: boolean = false, playerCollection: string[] | null) {
        const draft = new Draft(player_channel, duration, selections, await GetAllCards(), subsExtraVote, playerCollection);
	
		if (draft.player != '') {
			drafts.set(draft.player, draft);
		}

        draft.onDraftStarted(TwitchBot.DraftStarted);
        draft.onDraftStarted(DraftStarted);
        draft.onDraftStarted((player) => { ClearPreviewStatus(player) });

        draft.onDraftCanceled(TwitchBot.DraftCanceled);
        draft.onDraftCanceled(DraftCanceled);

        draft.onNewChoice(async (player_channel, choice) => {
            // delay 5 seconds before announcing a new choice for the stream to update
            if (draft.total > 0) await new Promise(f => setTimeout(f, 5000));
            TwitchBot.NewChoice(player_channel, choice);
            NewChoice(player_channel, choice);
        });

        //draft.onChoiceSelected(TwitchBot.ChoiceSelected);
        draft.onChoiceSelected(ChoiceSelected);

        draft.onDraftComplete(async (player_channel, deck) => {
            await new Promise(f=> setTimeout(f,2000));
            TwitchBot.DraftComplete(player_channel, deck)
            DraftComplete(player_channel, deck);
            await new Promise(f=> setTimeout(f,duration*2*1000))
            draft.CancelDraft();
        });

        draft.onVotingClosed(TwitchBot.VotingClosed)
        draft.onVotingClosed(VotingClosed);

        draft.onChoiceOverride(TwitchBot.ChoiceOverride)
        draft.onChoiceOverride(ChoiceOverride);

        return draft;
    }
}