import {
	ClearUserBattleViewer,
	GetCurrentEvent,
	UpdateUserBattleViewer,
	UpdateUserStatus
} from '$lib/server/event';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { EntrantStatus } from '$lib/event';
import { ApiClient } from '@twurple/api';

export const load = (async ({ parent }) => {
	const { user } = await parent();
	const currentEvent = GetCurrentEvent();
	return { user: user, currentEvent: currentEvent };
}) satisfies PageServerLoad;

export const actions = {
	join: async ({ locals }) => {
		if (!locals.user) throw error(403);
		UpdateUserStatus(locals.user.channelName, EntrantStatus.Joined);
	},
	unjoin: async ({ locals }) => {
		if (!locals.user) throw error(403);
		UpdateUserStatus(locals.user.channelName, EntrantStatus.Invited);
	},
	ready: async ({ request, locals }) => {
		if (!locals.user) throw error(403);
		const data = await request.formData();
		const battleChatter = data.get('battleChatter')?.toString().toLowerCase().trim();

		if (battleChatter) {
			const api = new ApiClient({ authProvider: locals.auth_provider });
			try {
				const battleChatterUser = await api.users.getUserByName(battleChatter);
				if (battleChatterUser) {
					UpdateUserStatus(locals.user.channelName, EntrantStatus.Ready);
					UpdateUserBattleViewer(locals.user.channelName, battleChatter);
				} else {
					return fail(400, { battleChatterNotFound: true, battleChatter: battleChatter });
				}
			} catch {
				return fail(400, { battleChatterNotFound: true, battleChatter: battleChatter });
			}
		} else {
			UpdateUserStatus(locals.user.channelName, EntrantStatus.Ready);
		}
	},
	unready: async ({ locals }) => {
		if (!locals.user) throw error(403);
		UpdateUserStatus(locals.user.channelName, EntrantStatus.Joined);
		ClearUserBattleViewer(locals.user.channelName);
	}
} satisfies Actions;
