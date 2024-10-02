import { EntrantStatus } from '$lib/event';
import DraftFactory from '$lib/snap/draftFactory';
import type { User } from '@prisma/client';
import { prisma } from './db';
import { type FeaturedCardMode } from '$lib/featuredCard';

export type Event = {
	duration: number;
	selections: number;
	featuredCardMode: FeaturedCardMode;
	featuredCardKey: string;
	entrants: Array<Entrant>;
	started: boolean;
};

export type Entrant = {
	user: User;
	battleViewer: string | undefined;
	status: EntrantStatus;
};

let currentEvent: Event | undefined = undefined;

export function CurrentEventExists(): boolean {
	return currentEvent !== undefined;
}

export function CurrentEventStarted(): boolean {
	return currentEvent !== undefined && currentEvent.started;
}

export function CreateEvent(
	duration: number,
	selections: number,
	entrants: User[],
	featuredCardMode: FeaturedCardMode = 'off',
	featuredCardKey: string = ''
) {
	if (CurrentEventExists()) return;

	currentEvent = {
		duration: duration,
		selections: selections,
		entrants: entrants.map((entrant) => {
			return { user: entrant, battleViewer: undefined, status: EntrantStatus.Invited };
		}),
		started: false,
		featuredCardMode: featuredCardMode,
		featuredCardKey: featuredCardKey
	};
}

export function CancelCurrentEvent() {
	currentEvent = undefined;
}

export async function StartCurrentEvent() {
	if (currentEvent == undefined || CurrentEventStarted()) return;

	const duration = currentEvent.duration;
	const selections = currentEvent.selections;
	const featuredCardMode = currentEvent.featuredCardMode;
	const featuredCardKey = currentEvent.featuredCardKey;
	currentEvent.entrants.forEach(async (entrant) => {
		if (entrant.status == EntrantStatus.Ready) {
			const userCollection = await prisma.userPreference.GetUserCollection(
				entrant.user.channelName
			);
			const draft = await DraftFactory.CreateDraft(
				entrant.user.channelName,
				duration,
				selections,
				false,
				userCollection,
				entrant.battleViewer,
				featuredCardMode,
				featuredCardKey
			);
			await draft.StartDraft();
		}
	});

	currentEvent.started = true;
}

export function UpdateUserStatus(username: string, status: EntrantStatus) {
	if (currentEvent == undefined || CurrentEventStarted()) return;

	const user = currentEvent.entrants.filter((entrant) => entrant.user.channelName == username)[0];
	if (user) {
		user.status = status;
	}
}

export function UpdateUserBattleViewer(username: string, battleViewer: string) {
	if (currentEvent == undefined || CurrentEventStarted()) return;

	const user = currentEvent.entrants.filter((entrant) => entrant.user.channelName == username)[0];
	if (user) {
		user.battleViewer = battleViewer;
	}
}

export function ClearUserBattleViewer(username: string) {
	if (currentEvent == undefined || CurrentEventStarted()) return;
	const user = currentEvent.entrants.filter((entrant) => entrant.user.channelName == username)[0];
	if (user) {
		user.battleViewer = undefined;
	}
}

export function GetCurrentEvent() {
	return currentEvent;
}

export function RemoveEntrant(channelName: string) {
	if (currentEvent) {
		const index = currentEvent.entrants.findIndex((entrant) => {
			return entrant.user.channelName == channelName;
		});
		if (index > -1) {
			currentEvent.entrants.splice(index, 1);
		}
	}
}

export function AddEntrant(entrant: User) {
	if (currentEvent) {
		currentEvent.entrants.push({
			user: entrant,
			battleViewer: undefined,
			status: EntrantStatus.Invited
		});
	}
}
