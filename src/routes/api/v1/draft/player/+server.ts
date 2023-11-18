import { error, json, type RequestHandler } from '@sveltejs/kit';
import Draft, { GetDraft } from '$lib/snap/draft';
import { ValidateSession } from '$lib/server/sessionHandler';
import TwitchBot from '$lib/server/twitchBot';

export const GET: RequestHandler = async ({ locals, cookies }) => {
	ValidateSession(cookies, locals.user, 'session_id');

	const draft = GetDraft(locals.user!.name);
	if (!draft) throw error(404);

	return json({cards: draft.cards, total: draft.total, player: draft.player, currentChoice: draft.currentChoice });
};

export const POST: RequestHandler = async ({ locals, cookies, url }) => {
	ValidateSession(cookies, locals.user, 'session_id');

	let duration = 120;

	if (url.searchParams.has('duration')) duration = +url.searchParams.get('duration')!

	const draft = new Draft({
		DraftStarted: TwitchBot.DraftStarted,
		DraftCanceled: TwitchBot.DraftCanceled,
		NewChoice: TwitchBot.NewChoice,
		ChoiceSelected: TwitchBot.ChoiceSelected,
		DraftComplete: TwitchBot.DraftComplete,
		VotingClosed: TwitchBot.VotingClosed,
		ChoiceOverride: TwitchBot.ChoiceOverride,
	}, duration);

	draft.StartDraft(locals.user!.name);

	return new Response(null, { status: 204 } );
};

export const DELETE: RequestHandler = async ({ cookies, locals }) => {
	ValidateSession(cookies, locals.user, 'session_id');

	const draft = GetDraft(locals.user!.name);
	draft?.CancelDraft();

	return new Response(null, { status: 204 } );
}