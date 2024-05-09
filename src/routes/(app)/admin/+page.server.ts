import { GetDrafts, GetPreviousDrafts } from '$lib/server/draftHandler';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ResetCards, UpdateCards } from '$lib/server/cardsHandler';
import { prisma } from '$lib/server/db';
import { ApiClient } from '@twurple/api';
import TwitchBot from '$lib/server/twitchBot';

export const load = (async ({ locals }) => {
	if (!locals.user || !locals.user.isAdmin) throw redirect(302, '/');
	const users = await prisma.user.GetAllUsers();
	const channels = users
		?.filter((user) => user.userPreferences?.botJoinsChannel)
		.map((user) => user.channelName);
	const joinedChannels = channels!.map((channel) => TwitchBot.IsBotInChannel(channel));
	const drafts = await GetDrafts();
	const previousDrafts = await GetPreviousDrafts();
	const authorizedUsers = users
		?.filter((user) => user.isAuthorized)
		.map((user) => user.channelName);
	const adminUsers = users?.filter((user) => user.isAdmin).map((user) => user.channelName);
	const setupCompleteUsers = users
		?.filter((user) => user.initialSetupDone)
		.map((user) => user.channelName);
	const organizers = users?.filter((user) => user.isOrganizer).map((user) => user.channelName);
	const otdBatches = await prisma.oneTimeDraftBatch.GetAllOneTimeDraftBatches();

	return {
		channels: channels,
		joinedChannels: joinedChannels,
		drafts: drafts,
		previousDrafts: previousDrafts,
		authorizedUsers: authorizedUsers,
		adminUsers: adminUsers,
		setupCompleteUsers: setupCompleteUsers,
		organizers: organizers,
		otdBatches: otdBatches
	};
}) satisfies PageServerLoad;

export const actions = {
	authorize: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const username = data.get('username')?.toString().toLowerCase();
		if (username) {
			const api = new ApiClient({ authProvider: locals.auth_provider });
			const user = await api.users.getUserByName(username);
			if (user) prisma.user.UpdateUserAuthorization(user, true);
		}
	},
	deauthorize: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const username = data.get('username')?.toString().toLowerCase();
		if (username) {
			const api = new ApiClient({ authProvider: locals.auth_provider });
			const user = await api.users.getUserByName(username);
			if (user) prisma.user.UpdateUserAuthorization(user, false);
		}
	},
	joinchannel: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const username = data.get('username')?.toString().toLowerCase();
		if (username) {
			const authProvider = locals.auth_provider;
			const api = new ApiClient({ authProvider });
			const user = await api.users.getUserByName(username);
			if (user) {
				TwitchBot.JoinChannel(username);
				prisma.user.AddChannel(user.id);
			}
		}
	},
	partchannel: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const username = data.get('username')?.toString().toLowerCase();
		if (username) {
			const authProvider = locals.auth_provider;
			const api = new ApiClient({ authProvider });
			const user = await api.users.getUserByName(username);
			if (user) {
				TwitchBot.PartChannel(username);
				prisma.user.RemoveChannel(user.id);
			}
		}
	},
	rejoinchannels: async ({ locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const channels = await prisma.user.GetChannels();
		channels.forEach((channel) => {
			if (!TwitchBot.IsBotInChannel(channel)) {
				TwitchBot.JoinChannel(channel);
			}
		});
	},
	updatecards: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const cards = data.get('files') as File;
		if (cards) {
			await UpdateCards(cards);
		}

		return { updated: true };
	},
	resetcards: async ({ locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		await ResetCards();
		return { reset: true };
	},
	resetsetup: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const user = data.get('username')?.toString();
		if (user) {
			await prisma.user.ResetSetupComplete(user);
		}

		return { reset: true };
	},
	generateOtdLinks: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		let validationError = false;
		let missingTag = false;
		let alreadyExists = false;
		let missingCount = false;
		let countZeroOrNegative = false;
		let missingExpiration = false;
		let missingDraftExpiration = false;
		let draftExpirationZeroOrNegative = false;

		const tagData = data.get('otdBatchTag');
		if (!tagData) validationError = missingTag = true;
		const tag = tagData?.toString();

		if (tag) {
			const existingBatch = await prisma.oneTimeDraftBatch.GetOneTimeBatch(tag);
			if (existingBatch) {
				validationError = alreadyExists = true;
			}
		}

		const countData = data.get('otdCount');
		if (!countData) validationError = missingCount = true;
		const count = Number(countData!.toString());
		if (!missingCount && count <= 0) validationError = countZeroOrNegative = true;

		const expirationData = data.get('otdExpiration');
		if (!expirationData) validationError = missingExpiration = true;
		const expiration = new Date(expirationData!.toString());
		expiration.setUTCHours(23, 59, 59, 999);

		const draftExpirationData = data.get('draftExpiration');
		if (!draftExpirationData) validationError = missingDraftExpiration = true;
		const draftExpiration = Number(draftExpirationData!.toString());
		if (draftExpiration <= 0) validationError = draftExpirationZeroOrNegative = true;

		const cards = data.get('files') as File;
		const cardData = JSON.parse(await cards.text()) as { all: { cardDefKey: string }[] };
		const cardDefKeys = cardData.all.map((card) => card.cardDefKey).join();

		const organizersData = data.getAll('organizers');
		const organizers: string[] = organizersData.map((data) => data.toString());
		const organizerIds = (await prisma.user.GetUsersByName(organizers))?.map(
			(organizer) => organizer.id
		);

		if (validationError) {
			return fail(400, {
				missingTag: missingTag,
				missingCount: missingCount,
				countZeroOrNegative: countZeroOrNegative,
				missingExpiration: missingExpiration,
				alreadyExists: alreadyExists,
				missingDraftExpiration: missingDraftExpiration,
				draftExpirationZeroOrNegative: draftExpirationZeroOrNegative,
				tagData: tagData,
				countData: countData,
				expirationData: expirationData,
				draftExpirationData: draftExpirationData,
				organizersData: organizersData
			});
		}

		const batch = await prisma.oneTimeDraftBatch.CreateOneTimeDraftBatch(
			tag!,
			count,
			expiration,
			cardDefKeys,
			draftExpiration,
			organizerIds
		);
		if (!batch) return fail(500);
		const links = batch?.drafts?.map(
			(draft) => `${new URL(request.url).origin}/otdraft?code=${draft.id}`
		);
		const dataUri = links ? 'data:text/plain;base64,' + btoa(links.join('\r\n')) : undefined;

		return { dataUri: dataUri, tag: batch?.tag };
	},
	getOtdBatch: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const tagData = data.get('tagData');
		if (!tagData) return fail(400, { checkMissingTag: true });
		const tag = tagData.toString();
		const batch = await prisma.oneTimeDraftBatch.GetOneTimeBatch(tag);
		if (!batch) return fail(404, { batchNotFound: true, checkTag: tag });

		const links = batch?.drafts?.map(
			(draft) => `${new URL(request.url).origin}/otdraft?code=${draft.id}`
		);
		const dataUri = links ? 'data:text/plain;base64,' + btoa(links.join('\r\n')) : undefined;
		return { checkDataUri: dataUri, batch: batch };
	},
	addOrganizer: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const organizerData = data.get('organizer');
		if (!organizerData) return fail(400, { organizerMissing: true });
		await prisma.user.UpdateUserOrganizer(organizerData.toString(), true);
	},
	removeOrganizer: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const organizerData = data.get('organizer');
		if (!organizerData) return fail(400, { organizerMissing: true });
		await prisma.user.UpdateUserOrganizer(organizerData?.toString(), false);
	}
} satisfies Actions;
