import { GetDrafts } from '$lib/server/draftHandler';
import { ApiClient } from '@twurple/api';
import type { PageServerLoad } from './$types';

export const load = (async ({locals}) => {
    const drafts = GetDrafts();
    const api = new ApiClient({authProvider: locals.auth_provider});
    const streams = await api.streams.getStreamsByUserNames(drafts.map(draft => draft.player));
    const activeStreams = streams.filter(stream => drafts.some(draft => stream.userName == draft.player));

    // const activeStreams = (await api.streams.getStreams({game: "1743359147"})).data

    const activeDrafts = activeStreams.map(stream => { return {channel: stream.userName, thumbnailUrl: stream.thumbnailUrl}});

    return { activeDrafts: activeDrafts, user_unauthorized: locals.user && !locals.user.isAuthorized};
}) satisfies PageServerLoad;