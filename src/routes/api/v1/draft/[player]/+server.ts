import { error, json, type RequestHandler } from '@sveltejs/kit';
import { StartDraft } from '$lib/snap/draft';

export const GET: RequestHandler = async ({ params, platform }) => {
	if (!platform?.env.KV) { throw error(503) }
	const KV = platform.env.KV;

	const value = await KV.get(params.player + "/draft")
	if (!value) throw error(404)

	const draft = JSON.parse(value)

	return json(draft);
	
};

export const PUT: RequestHandler = async ( { params, platform }) => {
	if (!platform?.env.KV) { throw error(503); }
	const KV = platform.env.KV;

	if (!params.player) { throw error(400); }

	const draft = StartDraft(params.player);
	await KV.put(params.player + "/draft", JSON.stringify(draft));
	await KV.put(params.player + "/choices", JSON.stringify(draft.currentChoice));

	return json(draft);
	
};