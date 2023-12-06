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

		return { draft: draft, choice: draft.currentChoice, botstatus: botstatus, player: draft.player };
	}

	const prevdraftret = await fetch('api/v1/draft/player?previous=true');
	if (prevdraftret.ok) {
		const prevdraft: Draft = await prevdraftret.json();
		return { draft: undefined, choice: undefined, botstatus: botstatus, player: prevdraft.player, previous_draft: prevdraft }
	}

	return { draft: null, choice: null, botstatus: botstatus, player: null };
}
