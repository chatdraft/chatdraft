import TwitchBot from '$lib/server/twitchBot';
import { GetPreviewStatus, TogglePreviewStatus } from '$lib/server/previewHandler';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { IsFullSourceConfigured, IsSplitSourceConfigured } from '$lib/server/browserSourceHandler';


export const load = (async ({locals}) => {
    if (!locals.user || !locals.user_authorized) throw redirect(302, '/');
    const user = locals.user?.name;
    let botInChannel = false;
    let previewMode = false;
    let full_source_configured = false;
    let split_sources_configured = false;
    if (user) {
        botInChannel = await TwitchBot.IsBotInChannel(user);
        previewMode = GetPreviewStatus(user)
        full_source_configured = IsFullSourceConfigured(user);
        split_sources_configured = IsSplitSourceConfigured(user);
    }
    return { user: user, botInChannel: botInChannel, previewMode: previewMode, full_source_configured: full_source_configured, split_sources_configured: split_sources_configured};
}) satisfies PageServerLoad;

export const actions = {
    join: async ({locals}) => {
        if (locals.user) {
            await TwitchBot.JoinChannel(locals.user.name);
        }
    },
    part: async ({locals}) => {
        if (locals.user) {
            await TwitchBot.PartChannel(locals.user.name);
        }
    },
    togglePreview: async ({locals}) => {
        if (locals.user) {
            TogglePreviewStatus(locals.user.name)
        }
    }
} satisfies Actions