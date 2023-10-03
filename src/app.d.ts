import type { DrizzleD1Database } from 'drizzle-orm/d1';

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				KV: KVNamespace;
			};
			cf?: unknown;
		}
		interface Locals {
			db: DrizzleD1Database;
		}
	}
}

export {};
