import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { GetPreviewStatus, TogglePreviewStatus } from '$lib/server/previewHandler';
import { DbUpdateUserSetupCompleteStatus } from '$lib/server/db';


export const load = (async ({locals}) => {
    if (locals.user && !locals.user.isAuthorized) throw redirect(302, '/');
    const user = locals.user?.channelName;
    let previewMode = false;
    if (user) {
        previewMode = GetPreviewStatus(user)
    }
    
    return { user: user, botInChannel: locals.user?.userPreferences?.botJoinsChannel, previewMode: previewMode };
}) satisfies PageServerLoad;

export const actions = {
    togglePreview: async ({locals}) => {
        if (locals.user) {
            TogglePreviewStatus(locals.user.channelName!)
        }
    },
    completeSetup: async ({locals}) => {
        if (locals.user) {
            DbUpdateUserSetupCompleteStatus(locals.user.channelName, true);
        }
    }
} satisfies Actions