import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import TwitchBot from '$lib/server/twitchBot';
import { GetDraft, GetPreviousDraft } from '$lib/server/draftHandler';

export const load = (async ({locals}) => {
    if (locals.user && !locals.user_authorized) throw redirect(302, '/');

    if (locals.user?.name) {
        const botstatus = await TwitchBot.IsBotInChannel(locals.user?.name);
        
        const draft = GetDraft(locals.user?.name);
        if (draft) {
            return { draft: draft.toIDraft(), choice: draft.currentChoice, draft_deck_code: draft.GetDeckCode(), botstatus: botstatus, player: draft.player };
        }

        const prevdraft = GetPreviousDraft(locals.user.name);
        if (prevdraft) {
            return { draft: undefined, choice: undefined, botstatus: botstatus, player: prevdraft.player, previous_draft: prevdraft.toIDraft(), prev_draft_deck_code: prevdraft.GetDeckCode() }
        }

        return { draft: null, choice: null, botstatus: botstatus, player: null };
    }
}) satisfies PageServerLoad;