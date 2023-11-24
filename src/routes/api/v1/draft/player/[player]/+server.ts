import { error, json, type RequestHandler } from '@sveltejs/kit';
import { GetDraft } from '$lib/snap/draft';

export const GET: RequestHandler = async ({ params }) => {
	if (!params.player) {
		throw error(400)
	}

	const draft = GetDraft(params.player)
	if (!draft) throw error(404);

	return json({cards: draft.cards, total: draft.total, player: draft.player, currentChoice: draft.currentChoice, duration: draft.duration });
};