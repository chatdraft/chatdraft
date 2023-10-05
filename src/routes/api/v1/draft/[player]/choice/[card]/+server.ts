import { error, type RequestHandler } from '@sveltejs/kit';
import { Choose } from '$lib/snap/draft';

export const PUT: RequestHandler = async ({ params, locals }) => {
	if (!locals.KV) {
		throw error(503);
	}

	const value = await locals.KV.get(params.player + '/draft');
	if (!value) {
		throw error(404);
	}

	const draft = JSON.parse(value);
	if (!params.card) {
		throw error(400);
	}

	let choice;
	switch (params.card) {
		case '1':
			choice = draft.currentChoice.card1;
			break;
		case '2':
			choice = draft.currentChoice.card2;
			break;
		case '3':
			choice = draft.currentChoice.card3;
			break;
	}

	Choose(draft, choice.cardDefKey);

	await locals.KV.set(params.player + '/draft', JSON.stringify(draft));

	return new Response(null, { status: 204 } );
};
