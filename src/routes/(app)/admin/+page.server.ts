import { GetDrafts, GetPreviousDrafts } from '$lib/server/draftHandler';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ResetCards, UpdateCards } from '$lib/server/cardsHandler';
import { DbAddChannel, DbUpdateUserAuthorization, DbGetChannels, DbRemoveChannel, DbGetAuthorizedUsers, DbGetAdminUsers, DbGetSetupCompleteUsers, DbResetSetupComplete } from '$lib/server/db';
import { ApiClient } from '@twurple/api';

export const load = (async ({locals}) => {
    if (!locals.user || !(locals.user.isAdmin)) throw redirect(302, '/')
    const channels = DbGetChannels();
    const drafts = GetDrafts();
    const previousDrafts = GetPreviousDrafts();
    const authorizedUsers = DbGetAuthorizedUsers() || [];
    const adminUsers = DbGetAdminUsers() || [];
    const setupCompleteUsers = DbGetSetupCompleteUsers() || [];

    return {
        channels: channels,
        drafts: drafts,
        previousDrafts: previousDrafts,
        authorizedUsers: authorizedUsers,
        adminUsers: adminUsers,
        setupCompleteUsers: setupCompleteUsers
    };
}) satisfies PageServerLoad;



export const actions = {
    authorize: async ({request, locals}) => {
        if (!locals.user || !(locals.user.isAdmin)) throw error(403)
        const data = await request.formData();
        const username = data.get("username")?.toString().toLowerCase();
        if (username) {
            const api = new ApiClient({authProvider: locals.auth_provider});
            const user = await api.users.getUserByName(username);
            if (user) DbUpdateUserAuthorization(user, true);
        }
    },
    deauthorize: async ({request, locals}) => {
        if (!locals.user || !(locals.user.isAdmin)) throw error(403)
        const data = await request.formData();
        const username = data.get("username")?.toString().toLowerCase();
        if (username) {
            const api = new ApiClient({authProvider: locals.auth_provider});
            const user = await api.users.getUserByName(username);
            if (user) DbUpdateUserAuthorization(user, false);
        }
    },
    joinchannel: async ({request, locals}) => {
        if (!locals.user || !(locals.user.isAdmin)) throw error(403)
        const data = await request.formData();
        const username = data.get("username")?.toString().toLowerCase();
        if (username) {
            const authProvider = locals.auth_provider;
            const api = new ApiClient({authProvider});
            const user = await api.users.getUserByName(username);
            if (user) {
                DbAddChannel(user.id);
            }
        }
    },
    partchannel: async ({request, locals}) => {
        if (!locals.user || !(locals.user.isAdmin)) throw error(403)
        const data = await request.formData();
        const username = data.get("username")?.toString().toLowerCase();
        if (username) {
            const authProvider = locals.auth_provider;
            const api = new ApiClient({authProvider});
            const user = await api.users.getUserByName(username);
            if (user) {
                DbRemoveChannel(user.id);
            }
        }
    },
    updatecards: async ({request, locals}) => {
        if (!locals.user || !(locals.user.isAdmin)) throw error(403)
        const data = await request.formData();
        const cards = data.get("files") as File;
        if (cards) {
            await UpdateCards(cards);
        }

        return { updated: true };
    },
    resetcards: async ({locals}) => {
        if (!locals.user || !(locals.user.isAdmin)) throw error(403)
        ResetCards();
        return { reset: true };
    },
    resetsetup: async ({request, locals}) => {
        if (!locals.user || !(locals.user.isAdmin)) throw error(403);
        const data = await request.formData();
        const user = data.get("username")?.toString();
        if (user)
        {
            await DbResetSetupComplete(user);
        }

        return { reset: true };
    }
} satisfies Actions