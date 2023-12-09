import type IDraft from '$lib/snap/draft';
import type { PageLoad } from '../$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params, url }) => {
	let hide = url.searchParams.get('hide');
	if ((hide != 'choice') && (hide != 'deck')) {
		hide = '';
	}

	const player: string = params.player;
	const ret = await fetch(`/api/v1/draft/player/${player}`);
	if (ret.ok) {
		const draft: IDraft = await ret.json();
		return { draft: draft, choice: draft.currentChoice, player: player, hide: hide };
	}

	return { draft: null, choice: null, player: player, hide: hide };
}
