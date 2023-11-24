import type Draft from '$lib/snap/draft';
import type { PageLoad } from '../$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const player: string = params.player;
	const ret = await fetch(`/api/v1/draft/player/${player}`);
	if (ret.ok) {
		const draft: Draft = await ret.json();
		return { draft: draft, choice: draft.currentChoice, player: player };
	}

	return { draft: null, choice: null, player: player };
}
