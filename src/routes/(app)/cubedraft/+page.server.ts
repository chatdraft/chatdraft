import { GetAllCards } from '$lib/server/cardsHandler';
import { GetLobbies, SetLobby } from '$lib/server/cubeDraftLobbyHandler';
import CubeDraft, { CreateGuestPlayer, CreateUserPlayer } from '$lib/snap/cubeDraft';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import crypto from 'node:crypto';
import { StringToFeaturedCardMode } from '$lib/featuredCard';

export const load = (async ({ locals }) => {
	const lobbies = GetLobbies().map((lobby) => lobby.toICubeDraft());
	const cardPool = await GetAllCards();
	return {
		user: locals.user,
		lobbies: lobbies,
		cardPool: cardPool
	};
}) satisfies PageServerLoad;

export const actions = {
	newLobby: async ({ locals, request }) => {
		const data = await request.formData();
		if (data) {
			const guestPlayerName = data.get('guestPlayerName')?.toString();
			const creator = locals.user
				? CreateUserPlayer(locals.user)
				: CreateGuestPlayer(guestPlayerName!);
			const lobbyName = GenerateRandomLobbyName(data.get('lobbyName')?.toString());
			const duration = Number(data.get('duration')?.toString());
			const selectionCount = Number(data.get('selectionCount')?.toString());
			const featuredCardModeRaw = data.get('featuredCardMode')?.toString().toLowerCase().trim();
			const featuredCardMode = StringToFeaturedCardMode(featuredCardModeRaw);
			const featuredCardDefKey = data.get('featuredCardDefKey')?.toString().trim();
			const closedDeckList = Boolean(data.get('closedDeckList')?.toString());

			const cardDb = await GetAllCards();

			const lobby = new CubeDraft(
				lobbyName,
				creator,
				duration,
				selectionCount,
				cardDb,
				featuredCardMode,
				featuredCardDefKey,
				closedDeckList
			);
			SetLobby(lobby);
			throw redirect(302, `/cubedraft/${lobby.lobbyName}`);
		}
	}
} satisfies Actions;

function GenerateRandomLobbyName(defaultLobbyName: string | undefined) {
	if (defaultLobbyName) return defaultLobbyName;
	else return crypto.randomBytes(20).toString('hex');
}
