import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const drafts = sqliteTable(
	'drafts',
	{
		id: integer('id').primaryKey(),
		cards: text('cards'),
		playerKey: text('playerKey'),
	},
	(drafts) => ({
		playerIdx: uniqueIndex('playerKey').on(drafts.playerKey)
	})
);

export type NewDraft = typeof drafts.$inferInsert;
export type Draft = typeof drafts.$inferSelect;