import type { RefreshingAuthProvider } from '@twurple/auth';
import type { ExtendedWebSocketServer } from '$lib/server/webSocketHandler';
import type { User, UserPreference } from '@prisma/client'

declare global {
	namespace App {
		interface Locals {
			user: User & { userPreferences: UserPreference | null } | null
			session: ?{
				id: string;
			};
			auth_provider: RefreshingAuthProvider;
			wss?: ExtendedWebSocketServer;
		}
		interface PublicEnv {
			PUBLIC_TWITCH_OAUTH_CLIENT_ID: string;
		}
	}
}

export {};
