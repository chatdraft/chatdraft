import TwitchBot from '$lib/server/twitchBot';
import { GetPreviewStatus, TogglePreviewStatus } from '$lib/server/previewHandler';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { IsChoiceSourceConfigured, IsDeckSourceConfigured, IsFullSourceConfigured } from '$lib/server/browserSourceHandler';
import { prisma } from '$lib/server/db';


export const load = (async ({locals}) => {
    if (!locals.user || !locals.user.isAuthorized) throw redirect(302, '/');
    const user = locals.user?.channelName;
    let previewMode = false;
    let full_source_configured = false;
    let deck_sources_configured = false;
    let choice_sources_configured = false;
    if (user) {
        previewMode = GetPreviewStatus(user)
        full_source_configured = IsFullSourceConfigured(user);
        deck_sources_configured = IsDeckSourceConfigured(user);
        choice_sources_configured = IsChoiceSourceConfigured(user);
    }

    const duration = locals.user.userPreferences?.draftRoundDuration || 90;
    const selectionCount = locals.user.userPreferences?.cardsPerRound || 6;
    const subsExtraVote = locals.user.userPreferences?.subsExtraVote || false;
    const collectionComplete = locals.user.userPreferences?.collection == null;
    const bgOpacity = locals.user.userPreferences ? locals.user.userPreferences.bgOpacity : 70;
    return { user: user, botInChannel: locals.user.userPreferences?.botJoinsChannel, previewMode: previewMode, full_source_configured: full_source_configured, deck_sources_configured: deck_sources_configured, choice_sources_configured: choice_sources_configured, duration: duration, selectionCount: selectionCount, subsExtraVote: subsExtraVote, collectionComplete: collectionComplete, bgOpacity: bgOpacity};
}) satisfies PageServerLoad;

export const actions = {
    join: async ({locals}) => {
        if (locals.user) {
            if (await TwitchBot.JoinChannel(locals.user.channelName!)) {
                const userPreferences = await prisma.user.AddChannel(locals.user.twitchID!);
                if (userPreferences) locals.user.userPreferences = userPreferences
            }
        }
    },
    part: async ({locals}) => {
        if (locals.user) {
            if (await TwitchBot.PartChannel(locals.user.channelName!)) {
                const userPreferences = await prisma.user.RemoveChannel(locals.user.twitchID!);
                if (userPreferences) locals.user.userPreferences = userPreferences;
            }
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
                const userPreferences = await prisma.userPreference.UpdateUserPreferences(locals.user.twitchID, duration, selectionCount, subsExtraVote);
                if (userPreferences) locals.user.userPreferences = userPreferences;
            }
        }
    },
    uploadCollection: async ({locals, request}) => {
        if (locals.user && locals.user.twitchID) {
            const formData = await request.formData();
            const collection = formData.get("collection") as File;
            const collectionData = JSON.parse(await collection.text());
            if (collectionData) {
                const cards: string[] = collectionData.ServerState.Cards.map((card: { CardDefId: string; }) => card.CardDefId).filter((value: string, index: number, array: string[]) => array.indexOf(value) === index)
                if (cards) {
                    const userPreference = await prisma.userPreference.UpdateUserCollection(locals.user.twitchID, cards);
                    if (userPreference) locals.user.userPreferences = userPreference;
                }
            }

        }
    },
    resetCollection: async ({locals}) => {
        if (locals.user && locals.user.twitchID) {
            const userPreference = await prisma.userPreference.ResetUserCollection(locals.user.twitchID);
            if (userPreference) locals.user.userPreferences = userPreference;
        }
    },
    updateOpacity: async ({request, locals}) => {
        if (locals.user && locals.user.twitchID) {
            const formData = await request.formData();
            const bgOpacity = Number(formData.get('bgOpacity')?.toString());
            const userPreference = await prisma.userPreference.UpdateUserBgOpacity(locals.user.twitchID, bgOpacity);
            
            if (userPreference) locals.user.userPreferences = userPreference;

            return {success: true};
        }
    }
} satisfies Actions