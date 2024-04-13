import { GetDrafts, GetPreviousDrafts } from '$lib/server/draftHandler';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ResetCards, UpdateCards } from '$lib/server/cardsHandler';
import { prisma } from '$lib/server/db';
import { ApiClient } from '@twurple/api';

export const load = (async ({locals}) => {
    if (!locals.user || !(locals.user.isAdmin)) throw redirect(302, '/')
    const users = await prisma.user.GetAllUsers();
    const channels = users?.filter((user) => user.userPreferences?.botJoinsChannel).map((user) => user.channelName)
    const drafts = await GetDrafts();
    const previousDrafts = await GetPreviousDrafts();
    const authorizedUsers = users?.filter((user) => user.isAuthorized).map((user) => user.channelName);
    const adminUsers = users?.filter((user) => user.isAdmin).map((user) => user.channelName);
    const setupCompleteUsers = users?.filter((user) => user.initialSetupDone).map((user) => user.channelName);

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
            if (user) prisma.user.UpdateUserAuthorization(user, true);
        }
    },
    deauthorize: async ({request, locals}) => {
        if (!locals.user || !(locals.user.isAdmin)) throw error(403)
        const data = await request.formData();
        const username = data.get("username")?.toString().toLowerCase();
        if (username) {
            const api = new ApiClient({authProvider: locals.auth_provider});
            const user = await api.users.getUserByName(username);
            if (user) prisma.user.UpdateUserAuthorization(user, false);
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
                prisma.user.AddChannel(user.id);
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
                prisma.user.RemoveChannel(user.id);
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
            await prisma.user.ResetSetupComplete(user);
        }

        return { reset: true };
    }
} satisfies Actions