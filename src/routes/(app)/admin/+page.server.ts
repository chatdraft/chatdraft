import { AuthorizeUser, DeauthorizeUser, GetAdminUsers, GetAuthorizedUsers, IsUserAdmin } from '$lib/server/authorizationHandler';
import { GetDrafts, GetPreviousDrafts } from '$lib/snap/draft';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { GetChannels } from '$lib/server/channelHandler';

export const load = (async ({locals}) => {
    if (!locals.user || !(await IsUserAdmin(locals.user.name))) throw redirect(302, '/')
    const channels = await GetChannels();
    const drafts = GetDrafts();
    const previousDrafts = GetPreviousDrafts();
    const authorizedUsers = GetAuthorizedUsers();
    const adminUsers = GetAdminUsers();
    return {
        channels: channels,
        drafts: drafts,
        previousDrafts: previousDrafts,
        authorizedUsers: authorizedUsers,
        adminUsers: adminUsers
    };
}) satisfies PageServerLoad;



export const actions = {
    authorize: async ({request}) => {
        const data = await request.formData();
        const username = data.get("username");
        if (username) {
            AuthorizeUser(username.toString());
        }
    },
    deauthorize: async ({request}) => {
        const data = await request.formData();
        const username = data.get("username");
        if (username) {
            DeauthorizeUser(username.toString());
        }
    }
} satisfies Actions