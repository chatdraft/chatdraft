import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GetDraft, GetPreviousDraft } from '$lib/server/draftHandler';

export const load = (async ({locals}) => {
    if (locals.user && !locals.user.isAuthorized) throw redirect(302, '/');

    if (locals.user?.channelName) {
        const draft = GetDraft(locals.user?.channelName);
        if (draft) {
            return { draft: draft.toIDraft(), choice: draft.currentChoice, draft_deck_code: draft.GetDeckCode(), botstatus: locals.user.userPreferences?.botJoinsChannel, player: draft.player, duration: locals.user.userPreferences?.draftRoundDuration, selectionCount: locals.user.userPreferences?.cardsPerRound, subsExtraVote: locals.user.userPreferences?.subsExtraVote };
        }

        const prevdraft = GetPreviousDraft(locals.user.channelName);
        if (prevdraft) {
            return { draft: undefined, choice: undefined, botstatus: locals.user?.userPreferences?.botJoinsChannel, player: prevdraft.player, previous_draft: prevdraft.toIDraft(), prev_draft_deck_code: prevdraft.GetDeckCode(), duration: locals.user.userPreferences?.draftRoundDuration, selectionCount: locals.user.userPreferences?.cardsPerRound, subsExtraVote: locals.user.userPreferences?.subsExtraVote  }
        }

        return { draft: null, choice: null, botstatus: locals.user?.userPreferences?.botJoinsChannel, player: null, duration: locals.user.userPreferences?.draftRoundDuration, selectionCount: locals.user.userPreferences?.cardsPerRound, subsExtraVote: locals.user.userPreferences?.subsExtraVote };
    }
}) satisfies PageServerLoad;