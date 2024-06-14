import type IDraft from '$lib/snap/draft';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params, url, data }) => {
	let hide = url.searchParams.get('hide');
	if (hide != 'choice' && hide != 'deck') {
		hide = '';
	}

	const player: string = params.player;
	const ret = await fetch(`/api/v1/draft/player/${player}`);
	if (ret.ok) {
		const draft: IDraft = await ret.json();
		return {
			draft: draft,
			choice: draft.currentChoice,
			player: player,
			hide: hide,
			previewStatus: data.previewStatus,
			previewDraft: data.previewDraft,
			bgOpacity: data.bgOpacity,
			displayDeck: params.viewer == 'viewer' ? draft.viewerDeck : draft.cards,
			displayName: params.viewer == 'viewer' ? draft.viewerName : draft.player
		};
	}

	return {
		draft: null,
		choice: null,
		player: player,
		hide: hide,
		previewStatus: data.previewStatus,
		previewDraft: data.previewDraft,
		bgOpacity: data.bgOpacity,
		displayDeck: data.previewStatus ? data.previewDraft.cards : [],
		displayName: data.previewStatus ? (params.viewer == 'viewer' ? '[Viewer]' : player) : ''
	};
};
