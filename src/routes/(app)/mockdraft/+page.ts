import type Draft from '$lib/snap/draft';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	let botstatus = false;
	const botret = await fetch('api/v1/bot/status');
	if (botret.ok) {
		botstatus = await botret.json();
	}
	
	const draftret = await fetch('api/v1/draft/player');
	if (draftret.ok) {
		const draft: Draft = await draftret.json();

		return { draft: draft, choice: draft.currentChoice, botstatus: botstatus };
	}

	return { draft: null, choice: null, botstatus: botstatus };
}
