import { error, json, type RequestHandler } from '@sveltejs/kit';
import { StartDraft } from '$lib/snap/draft';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.KV) {
		throw error(503);
	}
	const KV = locals.KV;

	const value = await KV.get(params.player + '/draft');
	if (!value) throw error(404);

	const draft = JSON.parse(value);

	return json(draft);
};

export const PUT: RequestHandler = async ({ params, locals }) => {
	if (!locals.KV) {
		throw error(503);
	}
	const KV = locals.KV;

	if (!params.player) {
		throw error(400);
	}

	const draft = StartDraft(params.player);
	await KV.set(params.player + '/draft', JSON.stringify(draft));
	await KV.set(params.player + '/choices', JSON.stringify(draft.currentChoice));

	return json(draft);
};
