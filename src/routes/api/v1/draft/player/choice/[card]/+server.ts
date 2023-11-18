import { error, type RequestHandler } from '@sveltejs/kit';
import { GetDraft } from '$lib/snap/draft';
import { ValidateSession } from '$lib/server/sessionHandler';

export const POST: RequestHandler = async ({ cookies, locals, params }) => {
	ValidateSession(cookies, locals.user, 'session_id')

	const draft = GetDraft(locals.user!.name)
	if (!draft || !draft.currentChoice) {
		throw error(404);
	}

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

	if (!choice) {
		throw(400)
	}

	draft.Choose(choice.cardDefKey);

	return new Response(null, { status: 204 } );
};
