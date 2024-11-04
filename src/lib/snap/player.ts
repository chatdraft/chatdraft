import type { FullUser } from '$lib/user';

export type Player = {
	name: string;
	fullUser: FullUser | undefined;
	collection: string[] | null;
	collectionLastUpdated: Date | null | undefined;
	status: PlayerStatus;
};

export enum PlayerStatus {
	joined = 'joined',
	ready = 'ready'
}
