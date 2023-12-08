import type { HelixUser } from '@twurple/api';
import type { RefreshingAuthProvider } from '@twurple/auth';
import type { ExtendedWebSocketServer } from '$lib/server/webSocketHandler';

declare global {
	namespace App {
		interface Locals {
			user: ?HelixUser;
			session: ?{
				id: string;
			};
			KV: Map<string, string>;
			auth_provider: RefreshingAuthProvider;
			wss?: ExtendedWebSocketServer;
			user_authorized: boolean;
		}
		interface PublicEnv {
			PUBLIC_TWITCH_OAUTH_CLIENT_ID: string;
		}
	}
}

export {};
