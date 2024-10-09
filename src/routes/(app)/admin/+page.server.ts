import { GetDrafts, GetPreviousDrafts } from '$lib/server/draftHandler';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { GetAllCards, ResetCards, UpdateCards } from '$lib/server/cardsHandler';
import { prisma } from '$lib/server/db';
import { ApiClient } from '@twurple/api';
import TwitchBot, { GetBotFollowers } from '$lib/server/twitchBot';
import {
	AddEntrant,
	CancelCurrentEvent,
	CreateEvent,
	GetCurrentEvent,
	RemoveEntrant,
	StartCurrentEvent
} from '$lib/server/event';
import { StringToFeaturedCardMode } from '$lib/featuredCard';
import { updateUserAuthorization } from '$lib/server/sessionHandler';

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
		?.filter((user) => user.authorization && user.authorization.chatDraft)
		.map((user) => user.channelName);
	const organizers = users?.filter((user) => user.isOrganizer).map((user) => user.channelName);
	const otdBatches = await prisma.oneTimeDraftBatch.GetAllOneTimeDraftBatches();
	const currentEvent = GetCurrentEvent();
	const botFollowers = await GetBotFollowers(locals.auth_provider, currentEvent);
	const cardDb = await GetAllCards();

	return {
		users: users,
		channels: channels,
		joinedChannels: joinedChannels,
		drafts: drafts,
		previousDrafts: previousDrafts,
		authorizedUsers: authorizedUsers,
		organizers: organizers,
		otdBatches: otdBatches,
		currentEvent: currentEvent,
		botFollowers: botFollowers,
		cardDb: cardDb
	};
}) satisfies PageServerLoad;

export const actions = {
	authorize: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const username = data.get('username')?.toString().toLowerCase();
		if (username) {
			const api = new ApiClient({ authProvider: locals.auth_provider });
			const twitchUser = await api.users.getUserByName(username);
			if (twitchUser) {
				const user = await prisma.user.UpdateUserAuthorization(twitchUser, true);
				if (user) {
					updateUserAuthorization(user);
				}
			}
		}
	},
	deauthorize: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const username = data.get('username')?.toString().toLowerCase();
		if (username) {
			const api = new ApiClient({ authProvider: locals.auth_provider });
			const twitchUser = await api.users.getUserByName(username);
			if (twitchUser) {
				const user = await prisma.user.UpdateUserAuthorization(twitchUser, false);
				if (user) updateUserAuthorization(user);
			}
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
				draftExpirationData: draftExpirationData
			});
		}

		const batch = await prisma.oneTimeDraftBatch.CreateOneTimeDraftBatch(
			tag!,
			count,
			expiration,
			cardDefKeys,
			draftExpiration
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
		const organizer = await prisma.user.UpdateUserOrganizer(organizerData.toString(), true);
		if (organizer) updateUserAuthorization(organizer);
	},
	removeOrganizer: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		const organizerData = data.get('organizer');
		if (!organizerData) return fail(400, { organizerMissing: true });
		const organizer = await prisma.user.UpdateUserOrganizer(organizerData.toString(), true);
		if (organizer) updateUserAuthorization(organizer);
	},
	updateBatchOrganizers: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();

		const batchId = data.get('batchId')?.toString();
		if (!batchId) return fail(400, { missingBatchId: true });

		const organizersData = data.getAll('organizers');
		const organizers: string[] = organizersData.map((data) => data.toString());
		const organizerIds = (await prisma.user.GetUsersByName(organizers))?.map(
			(organizer) => organizer.id
		);
		if (!organizerIds) return fail(400, { missingOrganizers: true });

		const batch = await prisma.oneTimeDraftBatch.UpdateOneTimeBatchOrganizer(batchId, organizerIds);
		return { batch: batch };
	},
	createEvent: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		if (data) {
			const duration = Number(data.get('eventDuration')?.toString());
			const selectionCount = Number(data.get('eventSelections')?.toString());
			const featuredCardModeRaw = data.get('featuredCardMode')?.toString().toLowerCase().trim();
			const featuredCardMode = StringToFeaturedCardMode(featuredCardModeRaw);
			const featuredCardDefKey = data.get('featuredCardDefKey')?.toString().trim();
			const entrantNamesData = data.getAll('entrants');
			const entrantNames: string[] = entrantNamesData.map((data) => data.toString());
			const entrants = await prisma.user.GetUsersByName(entrantNames);
			if (entrants && entrants.length >= 2) {
				CreateEvent(duration, selectionCount, entrants, featuredCardMode, featuredCardDefKey);
			} else return fail(400, { entrantsUnspecified: true });
		}

		return { currentEvent: GetCurrentEvent() };
	},
	startEvent: async ({ locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		StartCurrentEvent();
	},
	cancelEvent: async ({ locals }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		CancelCurrentEvent();
	},
	addEntrant: async ({ locals, request }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const currentEvent = GetCurrentEvent();
		if (currentEvent) {
			const data = await request.formData();
			if (data) {
				const newEntrant = data.get('newEntrant')?.toString();
				if (newEntrant) {
					const user = await prisma.user.GetUserByName(newEntrant);
					if (
						currentEvent.entrants.find((entrant) => entrant.user.channelName == user?.channelName)
					) {
						return fail(400, { userAlreadyEntered: true });
					}
					if (user && user.authorization && user.authorization.chatDraft) {
						AddEntrant(user);
					} else {
						return fail(400, { entrantNotFound: true });
					}
				}
			} else {
				return fail(400, { newEntrantUnspecified: true });
			}
		} else {
			return fail(400, { noCurrentEvent: true });
		}
	},
	removeEventEntrant: async ({ locals, request }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		if (data) {
			const removedEntrant = data.get('removedEntrant')?.toString();
			if (removedEntrant) RemoveEntrant(removedEntrant);
		}
	},
	updateUser: async ({ locals, request }) => {
		if (!locals.user || !locals.user.isAdmin) throw error(403);
		const data = await request.formData();
		if (data) {
			const userId = data.get('id')?.toString();
			const isOrganizer = Boolean(data.get('isOrganizer'));
			const initialSetupDone = Boolean(data.get('initialSetupDone'));
			const canChatDraft = Boolean(data.get('canChatDraft'));
			const canCubeDraft = Boolean(data.get('canCubeDraft'));
			const canCreateCubeDraftLobby = Boolean(data.get('canCreateCubeDraftLobby'));
			const canSoloDraft = Boolean(data.get('canSoloDraft'));

			if (userId) {
				const user = await prisma.user.UpdateUserFlags(
					userId,
					isOrganizer,
					initialSetupDone,
					canChatDraft,
					canCubeDraft,
					canCreateCubeDraftLobby,
					canSoloDraft
				);
				if (user) updateUserAuthorization(user);
			}
		}
	}
} satisfies Actions;
