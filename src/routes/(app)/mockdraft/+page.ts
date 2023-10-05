import type { Draft } from '$lib/snap/draft';

export const ssr = false;

export async function load({ fetch }) {
	const ret = await fetch('api/v1/draft/Player');
	if (ret.ok) {
		const draft: Draft = await ret.json();
		return { draft: draft, choice: draft.currentChoice };
	}
	return { draft: null, choice: null };
}
