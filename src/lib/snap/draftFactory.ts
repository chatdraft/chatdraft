import { GetAllCards } from '$lib/server/cardsHandler';
import { GetDraft, SetPreviousDraft, drafts } from '$lib/server/draftHandler';
import { ClearPreviewStatus } from '$lib/server/previewHandler';
import TwitchBot from '$lib/server/twitchBot';
import {
	BattlerChoice,
	ChoiceOverride,
	ChoiceSelected,
	DraftCanceled,
	DraftComplete,
	DraftStarted,
	NewChoice,
	VotingClosed
} from '$lib/server/webSocketUtils';
import { Draft } from './draft';

/**
 * DraftFactory creates drafts and manages linking all the events and signals
 * coming from the drafts
 *
 * @export
 * @class DraftFactory
 * @typedef {DraftFactory}
 */
export default class DraftFactory {
	/**
	 * Creates an instance of a draft
	 *
	 * @public
	 * @static
	 * @async
	 * @param {string} player_channel The Twitch channel for the chat draft
	 * @param {number} duration The duration of each voting period
	 * @param {number} selections The number of selections per voting period
	 * @param {boolean} [subsExtraVote=false] Whether subscribers get +1 added to their vote
	 * @param {(string[] | null)} playerCollection List of cardDefKeys in the players collection or empty array if complete.
	 * @param {string} battleChatter The chatter also drafting in a chatter battle if any
	 * @returns {Draft} The new draft.
	 */
	public static async CreateDraft(
		player_channel: string,
		duration: number,
		selections: number,
		subsExtraVote: boolean = false,
		playerCollection: string[] | null,
		battleChatter: string | undefined = undefined
	) {
		const currentDraft = GetDraft(player_channel);
		if (currentDraft) return currentDraft;

		const draft = new Draft(
			player_channel,
			duration,
			selections,
			await GetAllCards(),
			subsExtraVote,
			playerCollection,
			battleChatter
		);

		if (draft.player != '') {
			drafts.set(draft.player, draft);
		}

		draft.onDraftStarted(TwitchBot.DraftStarted);
		draft.onDraftStarted(DraftStarted);
		draft.onDraftStarted((player) => {
			ClearPreviewStatus(player);
		});

		draft.onDraftCanceled(TwitchBot.DraftCanceled);
		draft.onDraftCanceled(DraftCanceled);

		draft.onNewChoice(async (player_channel, choice) => {
			// delay 5 seconds before announcing a new choice for the stream to update
			if (draft.total > 0) await new Promise((f) => setTimeout(f, 5000));
			TwitchBot.NewChoice(player_channel, choice);
			NewChoice(player_channel, choice);
		});

		//draft.onChoiceSelected(TwitchBot.ChoiceSelected);
		draft.onChoiceSelected(ChoiceSelected);

		draft.onDraftComplete(async (draft) => {
			await new Promise((f) => setTimeout(f, 2000));
			TwitchBot.DraftComplete(draft.player, draft.cards, draft.viewerName, draft.viewerDeck);
			DraftComplete(draft.player, draft.cards);
			await new Promise((f) => setTimeout(f, duration * 2 * 1000));
			SetPreviousDraft(draft);
			draft.CancelDraft();
		});

		draft.onVotingClosed(TwitchBot.VotingClosed);
		draft.onVotingClosed(VotingClosed);

		draft.onChoiceOverride(TwitchBot.ChoiceOverride);
		draft.onChoiceOverride(ChoiceOverride);

		draft.onBattlerChoice(BattlerChoice);

		return draft;
	}
}
