import type { FullUser } from '$lib/user';

export type Player = {
	name: string;
	fullUser: FullUser | undefined;
	collection: string[] | null;
	collectionLastUpdated: Date | null | undefined;
	status: PlayerStatus;
	cardSelected?: boolean;
};

export enum PlayerStatus {
	joined = 'joined',
	ready = 'ready'
}
