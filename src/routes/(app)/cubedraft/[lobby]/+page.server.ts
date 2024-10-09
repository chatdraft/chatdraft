import { CloseLobby, GetLobby } from '$lib/server/cubeDraftLobbyHandler';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const lobby = GetLobby(params.lobby);
	if (!lobby) throw error(404, `Lobby ${params.lobby} not found.`);
	const userDraft = lobby?.drafts.find((draft) => draft.player == locals.user?.channelName);
	const selectedCardIndex = Number(userDraft?.currentChoice?.votes.get(userDraft.player));
	const selectedCard =
		selectedCardIndex !== undefined
			? userDraft?.currentChoice?.cards[selectedCardIndex - 1]
			: undefined;
	return {
		lobby: lobby?.toICubeDraft(),
		draft: userDraft?.toIDraft(),
		selectedCardIndex: selectedCardIndex,
		selectedCard: selectedCard
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
	}
} satisfies Actions;
