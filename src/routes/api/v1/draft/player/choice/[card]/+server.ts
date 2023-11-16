import { error, type RequestHandler } from '@sveltejs/kit';
import { Choose, GetDraft } from '$lib/snap/draft';
import { fetchSession } from '$lib/server/sessionHandler';

export const POST: RequestHandler = async ({ cookies, locals, params }) => {
	const session_id = cookies.get('session_id');
	if (!session_id || !locals.user) {
		throw error(401);
	}
	
	const session = fetchSession(session_id);
	if (session?.user_id != locals.user?.id) {
		throw error(403);
	}

	const draft = GetDraft(locals.user.name)
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

	Choose(draft, choice.cardDefKey);

	return new Response(null, { status: 204 } );
};
