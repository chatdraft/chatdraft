import TwitchBot from "$lib/server/twitchBot";
import { ChoiceOverride, ChoiceSelected, DraftCanceled, DraftComplete, DraftStarted, NewChoice, VotingClosed } from "$lib/server/webSocketUtils";
import { Draft } from "./draft";

export default class DraftFactory {
    public static CreateDraft(duration: number, selections: number) {
        const draft = new Draft(duration, selections);

        draft.onDraftStarted(TwitchBot.DraftStarted);
        draft.onDraftStarted(DraftStarted)

        draft.onDraftCanceled(TwitchBot.DraftCanceled);
        draft.onDraftCanceled(DraftCanceled);

        draft.onNewChoice(async (player_channel, choice) => {
            // delay 5 seconds before announcing a new choice for the stream to update
            await new Promise(f => setTimeout(f, 5000));
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