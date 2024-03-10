import TwitchBot from '$lib/server/twitchBot';
import { GetPreviewStatus, TogglePreviewStatus } from '$lib/server/previewHandler';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';


export const load = (async ({locals}) => {
    if (!locals.user || !locals.user_authorized) throw redirect(302, '/');
    const user = locals.user?.name;
    let botInChannel = false;
    let previewMode = false;
    if (user) {
        botInChannel = await TwitchBot.IsBotInChannel(user);
        previewMode = GetPreviewStatus(user)
    }
    return { user: user, botInChannel: botInChannel, previewMode: previewMode};
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