import { error, json, type RequestHandler } from '@sveltejs/kit';
import { GetDraft } from '$lib/snap/draft';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!params.player) {
		throw error(400)
	}

	if (!locals.user) throw error(404);

	const draft = GetDraft(locals.user.name)
	if (!draft) throw error(404);

	return json({cards: draft.cards, total: draft.total, player: draft.player, currentChoice: draft.currentChoice });
};