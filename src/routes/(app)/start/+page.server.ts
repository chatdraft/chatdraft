import TwitchBot from '$lib/server/twitchBot';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { GetPreviewStatus, TogglePreviewStatus } from '$lib/server/previewHandler';


export const load = (async ({locals, url}) => {
    if (locals.user && !locals.user_authorized) throw redirect(302, '/');
    const user = locals.user?.name;
    let botInChannel = false;
    let previewMode = false;
    if (user) {
        botInChannel = await TwitchBot.IsBotInChannel(user);
        previewMode = GetPreviewStatus(user)
    }
    
    return { user: user, botInChannel: botInChannel, url_base: url.origin, previewMode: previewMode };
}) satisfies PageServerLoad;

export const actions = {
    togglePreview: async ({locals}) => {
        if (locals.user) {
            TogglePreviewStatus(locals.user.name)
        }
    }
} satisfies Actions