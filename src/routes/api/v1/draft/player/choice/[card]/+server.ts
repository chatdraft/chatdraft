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

	const selection = Number(params.card);
	if ((selection < 0) || (selection > draft.selections)) {
		throw error(400);
	};
	const choice = draft.currentChoice.cards[selection];

	if (!choice) {
		throw error(400);
	}

	draft.Choose(choice.cardDefKey, true);

	return new Response(null, { status: 204 } );
};
