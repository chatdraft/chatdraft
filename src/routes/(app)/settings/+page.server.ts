import TwitchBot from '$lib/server/twitchBot';
import { GetPreviewStatus, TogglePreviewStatus } from '$lib/server/previewHandler';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { IsFullSourceConfigured, IsSplitSourceConfigured } from '$lib/server/browserSourceHandler';
import { DbUpdateUserPreferences } from '$lib/server/db';


export const load = (async ({locals}) => {
    if (!locals.user || !locals.user.isAuthorized) throw redirect(302, '/');
    const user = locals.user?.channelName;
    let previewMode = false;
    let full_source_configured = false;
    let split_sources_configured = false;
    if (user) {
        previewMode = GetPreviewStatus(user)
        full_source_configured = IsFullSourceConfigured(user);
        split_sources_configured = IsSplitSourceConfigured(user);
    }
    const duration = locals.user.userPreferences?.draftRoundDuration || 90;
    const selectionCount = locals.user.userPreferences?.cardsPerRound || 6;
    const subsExtraVote = locals.user.userPreferences?.subsExtraVote || false;
    return { user: user, botInChannel: locals.user.userPreferences?.botJoinsChannel, previewMode: previewMode, full_source_configured: full_source_configured, split_sources_configured: split_sources_configured, duration: duration, selectionCount: selectionCount, subsExtraVote: subsExtraVote};
}) satisfies PageServerLoad;

export const actions = {
    join: async ({locals}) => {
        if (locals.user) {
            await TwitchBot.JoinChannel(locals.user.channelName!, locals.user.twitchID!);
        }
    },
    part: async ({locals}) => {
        if (locals.user) {
            await TwitchBot.PartChannel(locals.user.channelName!, locals.user.twitchID!);
        }
    },
    togglePreview: async ({locals}) => {
        if (locals.user) {
            TogglePreviewStatus(locals.user.channelName!)
        }
    },
    updatePreferences: async ({locals, request}) => {
        if (locals.user && locals.user.twitchID) {
            const data = await request.formData();
            if (data) {
                const duration = Number(data.get("duration")?.toString());
                const selectionCount = Number(data.get("selectionCount")?.toString());
                const subsExtraVote = Boolean(data.get("subsExtraVote")?.toString());
                DbUpdateUserPreferences(locals.user.twitchID, duration, selectionCount, subsExtraVote);
            }
        }
    }
} satisfies Actions