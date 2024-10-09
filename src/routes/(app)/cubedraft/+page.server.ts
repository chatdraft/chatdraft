import { GetAllCards } from '$lib/server/cardsHandler';
import { GetLobbies, SetLobby } from '$lib/server/cubeDraftLobbyHandler';
import CubeDraft, { CreateGuestPlayer, CreateUserPlayer } from '$lib/snap/cubeDraft';
import { error, redirect } from '@sveltejs/kit';
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
		if (!locals.user) throw error(401, 'User not logged in.');
		if (!locals.user.authorization || !locals.user.authorization.cubeDraftCreateLobby)
			throw error(403, 'User not authorized to create cube draft lobbies.');
		const data = await request.formData();
		if (data) {
			const guestPlayerName = data.get('guestPlayerName')?.toString();
			const creator = locals.user
				? CreateUserPlayer(locals.user)
				: CreateGuestPlayer(guestPlayerName!);
			const lobbyName = GenerateRandomLobbyName(data.get('lobbyName')?.toString()).trim();
			const duration = Number(data.get('duration')?.toString());
			const selectionCount = Number(data.get('selectionCount')?.toString());
			const featuredCardModeRaw = data.get('featuredCardMode')?.toString().toLowerCase().trim();
			const featuredCardMode = StringToFeaturedCardMode(featuredCardModeRaw);
			const featuredCardDefKey = data.get('featuredCardDefKey')?.toString().trim();
			const faceDownDraft = Boolean(data.get('faceDownDraft')?.toString());

			const cardDb = await GetAllCards();

			const lobby = new CubeDraft(
				lobbyName,
				creator,
				duration,
				selectionCount,
				cardDb,
				featuredCardMode,
				featuredCardDefKey,
				faceDownDraft
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
