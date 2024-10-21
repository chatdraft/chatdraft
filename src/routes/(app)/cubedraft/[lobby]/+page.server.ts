import { CloseLobby, GetLobby } from '$lib/server/cubeDraftLobbyHandler';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { GetAllCards } from '$lib/server/cardsHandler';
import { StringToFeaturedCardMode } from '$lib/featuredCard';

export const load = (async ({ params, locals }) => {
	const lobby = GetLobby(params.lobby);
	if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
	const userDraft = lobby?.drafts.find((draft) => draft.player == locals.user?.channelName);
	const selectedCardIndex = Number(userDraft?.currentChoice?.votes.get(userDraft.player));
	const selectedCard =
		selectedCardIndex !== undefined
			? userDraft?.currentChoice?.cards[selectedCardIndex - 1]
			: undefined;
	const cardDb = await GetAllCards();
	return {
		lobby: lobby?.toICubeDraft(),
		draft: userDraft?.toIDraft(),
		selectedCardIndex: selectedCardIndex,
		selectedCard: selectedCard,
		cardDb: cardDb,
		canEditLobby: lobby.creator.fullUser?.id == locals.user?.id
	};
}) satisfies PageServerLoad;

export const actions = {
	joinLobby: async ({ locals, params }) => {
		if (!locals.user || !locals.user.authorization || !locals.user.authorization.cubeDraft)
			throw redirect(302, '/');
		const lobby = GetLobby(params.lobby);
		if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
		await lobby.AddUserPlayer(locals.user);
	},
	leaveLobby: async ({ locals, params }) => {
		if (!locals.user) throw redirect(302, '/');
		const lobby = GetLobby(params.lobby);
		if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
		if (lobby.creator.fullUser?.id == locals.user.id)
			throw error(400, 'Lobby creator cannot leave lobby.');
		await lobby.RemoveUserPlayer(locals.user);
	},
	startLobby: async ({ locals, params }) => {
		if (!locals.user || !locals.user.authorization || !locals.user.authorization.cubeDraft)
			throw redirect(302, '/');
		const lobby = GetLobby(params.lobby);
		if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
		if (lobby.creator.fullUser?.id != locals.user.id)
			throw error(403, 'You must be the lobby creator to start the draft.');
		await lobby.StartDraft();
	},
	voteCard: async ({ locals, params, request }) => {
		if (!locals.user || !locals.user.authorization || !locals.user.authorization.cubeDraft)
			throw redirect(302, '/');
		const lobby = GetLobby(params.lobby);
		if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
		const player = lobby.players.find((player) => player.fullUser?.id == locals.user?.id);
		if (!player) throw error(403, 'User not in lobby unauthorized to vote in draft.');
		const data = await request.formData();
		const selectionCardDefKey = data.get('selection')?.toString();
		if (!selectionCardDefKey) throw error(400, 'No card selected');
		lobby.Vote(player.name, (Number(selectionCardDefKey) + 1).toString());
	},
	closeLobby: async ({ locals, params }) => {
		if (!locals.user || !locals.user.authorization || !locals.user.authorization.cubeDraft)
			throw redirect(302, '/');
		const lobby = GetLobby(params.lobby);
		if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
		if (lobby.creator.fullUser?.id != locals.user.id)
			throw error(403, 'You must be the lobby creator to start the draft.');
		CloseLobby(lobby);
		throw redirect(302, '/cubedraft');
	},
	removePlayer: async ({ locals, params, request }) => {
		if (!locals.user || !locals.user.authorization || !locals.user.authorization.cubeDraft)
			throw redirect(302, '/');
		const lobby = GetLobby(params.lobby);
		if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
		if (lobby.creator.fullUser?.id != locals.user.id)
			throw error(403, 'You must be the lobby creator to remove a player.');
		const data = await request.formData();
		const playerName = data.get('playerName')?.toString();
		if (playerName) lobby.RemoveGuestPlayer(playerName);
	},
	updateRemovedCards: async ({ locals, params, request }) => {
		if (!locals.user || !locals.user.authorization || !locals.user.authorization.cubeDraft)
			throw redirect(302, '/');
		const lobby = GetLobby(params.lobby);
		if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
		if (lobby.creator.fullUser?.id != locals.user.id)
			throw error(403, 'You must be the lobby creator to update the removed cards.');
		const data = await request.formData();
		const removedCardsData = data.getAll('cards');
		const removedCards: string[] = removedCardsData.map((data) => data.toString());
		lobby.UpdateRemovedCards(removedCards);
	},
	updateLobby: async ({ locals, params, request }) => {
		if (!locals.user || !locals.user.authorization || !locals.user.authorization.cubeDraft)
			throw redirect(302, '/');
		const lobby = GetLobby(params.lobby);
		if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
		if (lobby.creator.fullUser?.id != locals.user.id)
			throw error(403, 'You must be the lobby creator to update the removed cards.');
		const data = await request.formData();
		const duration = Number(data.get('duration')?.toString());
		const selectionCount = Number(data.get('selectionCount')?.toString());
		const featuredCardModeRaw = data.get('featuredCardMode')?.toString().toLowerCase().trim();
		const featuredCardMode = StringToFeaturedCardMode(featuredCardModeRaw);
		const featuredCardDefKey = data.get('featuredCardDefKey')?.toString().trim();
		const faceDownDraft = Boolean(data.get('faceDownDraft')?.toString());
		const removedCardsData = data.getAll('cards');
		const removedCards: string[] = removedCardsData.map((data) => data.toString());
		await lobby.UpdateLobby(
			duration,
			selectionCount,
			featuredCardMode,
			featuredCardDefKey,
			faceDownDraft,
			removedCards
		);
	},
	togglePlayerReady: async ({ locals, params }) => {
		if (!locals.user || !locals.user.authorization || !locals.user.authorization.cubeDraft)
			throw redirect(302, '/');
		const lobby = GetLobby(params.lobby);
		if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
		const player = lobby.players.find((player) => player.fullUser?.id == locals.user?.id);
		if (!player) throw error(403, 'User not in lobby.');
		lobby.TogglePlayerReady(player.name);
	}
} satisfies Actions;
