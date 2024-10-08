import { GetDrafts } from '$lib/server/draftHandler';
import { ApiClient } from '@twurple/api';
import type { PageServerLoad } from './$types';
import { deleteSession } from '$lib/server/sessionHandler';

export const load = (async ({ locals, request, cookies }) => {
	const drafts = GetDrafts();
	const api = new ApiClient({ authProvider: locals.auth_provider });
	const streams = await api.streams.getStreamsByUserNames(drafts.map((draft) => draft.player));
	const activeStreams = streams.filter((stream) =>
		drafts.some((draft) => stream.userName == draft.player)
	);

	// const activeStreams = (await api.streams.getStreams({game: "1743359147"})).data

	const activeDraftStreams = activeStreams
		.map((stream) => {
			return {
				channel: stream.userName,
				thumbnailUrl: stream.thumbnailUrl,
				draft: drafts.find((draft) => draft.player == stream.userName) || { total: 12 }
			};
		})
		.sort((a, b) => a.draft.total - b.draft.total);

	if (new URL(request.url).searchParams.get('timedout')) {
		if (locals.session) {
			cookies.delete('session_id', { path: '/', httpOnly: true });
			deleteSession(locals.session.id);
			locals.user = null;
		}
	}

	return {
		activeDrafts: activeDraftStreams,
		user_unauthorized:
			locals.user && locals.user.authorization && !locals.user.authorization.chatDraft
	};
}) satisfies PageServerLoad;
