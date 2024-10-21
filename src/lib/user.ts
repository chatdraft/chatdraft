import type { User, UserPreference, UserAuthorization } from '@prisma/client';

export type FullUser = User & { userPreferences: UserPreference | null } & {
	authorization: UserAuthorization | null;
};
