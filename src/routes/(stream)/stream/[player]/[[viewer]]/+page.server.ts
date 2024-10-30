import type { PageServerLoad } from './$types';
import { GetPreviewStatus } from '$lib/server/previewHandler';
import { GetDraft, GetPreviewDraft } from '$lib/server/draftHandler';
import { ApiClient } from '@twurple/api';
import { prisma } from '$lib/server/db';

export const ssr = false;

export const load = (async ({ params, locals, url }) => {
	let hide = url.searchParams.get('hide');
	if (hide != 'choice' && hide != 'deck') {
		hide = '';
	}

	const player: string = params.player;
	const draft = await GetDraft(player);
	const previewStatus = GetPreviewStatus(player);
	const previewDraft = await GetPreviewDraft();
	let viewerProfilePicture = undefined;
	if (draft?.viewerName) {
		const api = new ApiClient({ authProvider: locals.auth_provider });
		viewerProfilePicture = (await api.users.getUserByName(draft?.viewerName))?.profilePictureUrl;
	}

	const bgOpacity =
		locals.user?.userPreferences?.bgOpacity ??
		(await prisma.userPreference.GetUserPreference(player))?.bgOpacity ??
		70;

	return {
		draft: draft?.toIDraft(),
		choice: draft?.currentChoice,
		player: player,
		hide: hide,
		previewStatus: previewStatus,
		previewDraft: previewDraft,
		bgOpacity: bgOpacity,
		displayDeck: previewStatus
			? previewDraft.cards
			: params.viewer == 'viewer'
			? draft?.viewerDeck.toSorted((a, b) => {
					return a.cost - b.cost;
			  })
			: draft?.cards.toSorted((a, b) => {
					return a.cost - b.cost;
			  }),
		displayName: previewStatus
			? params.viewer == 'viewer'
				? '[Viewer]'
				: player
			: params.viewer == 'viewer'
			? draft?.viewerName
			: player,
		viewerProfilePicture: viewerProfilePicture
	};
}) satisfies PageServerLoad;
