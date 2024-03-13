import { AuthorizeUser, DeauthorizeUser, GetAdminUsers, GetAuthorizedUsers, IsUserAdmin } from '$lib/server/authorizationHandler';
import { GetDrafts, GetPreviousDrafts } from '$lib/server/draftHandler';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AddChannel, GetChannels, RemoveChannel } from '$lib/server/channelHandler';
import { ResetCards, UpdateCards } from '$lib/server/cardsHandler';

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
    authorize: async ({request, locals}) => {
        if (!locals.user || !(await IsUserAdmin(locals.user.name))) throw error(403)
        const data = await request.formData();
        const username = data.get("username");
        if (username) {
            AuthorizeUser(username.toString());
        }
    },
    deauthorize: async ({request, locals}) => {
        if (!locals.user || !(await IsUserAdmin(locals.user.name))) throw error(403)
        const data = await request.formData();
        const username = data.get("username");
        if (username) {
            DeauthorizeUser(username.toString());
        }
    },
    joinchannel: async ({request, locals}) => {
        if (!locals.user || !(await IsUserAdmin(locals.user.name))) throw error(403)
        const data = await request.formData();
        const username = data.get("username");
        if (username) {
            AddChannel(username.toString());
        }
    },
    partchannel: async ({request, locals}) => {
        if (!locals.user || !(await IsUserAdmin(locals.user.name))) throw error(403)
        const data = await request.formData();
        const username = data.get("username");
        if (username) {
            RemoveChannel(username.toString());
        }
    },
    updatecards: async ({request, locals}) => {
        if (!locals.user || !(await IsUserAdmin(locals.user.name))) throw error(403)
        const data = await request.formData();
        const cards = data.get("files") as File;
        if (cards) {
            await UpdateCards(cards);
        }

        return { updated: true };
    },
    resetcards: async ({locals}) => {
        if (!locals.user || !(await IsUserAdmin(locals.user.name))) throw error(403)
        ResetCards();
        return { reset: true };
    }
} satisfies Actions