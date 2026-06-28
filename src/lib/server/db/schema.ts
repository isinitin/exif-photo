import { relations, sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { customAlphabet } from 'nanoid/non-secure';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const photos = sqliteTable(
	'photos',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => nanoid()),

		title: text('title'),
		description: text('description'),

		key: text('key').notNull(),
		url: text('url').notNull(),

		width: integer('width').notNull(),
		height: integer('height').notNull(),
		blurhash: text('blurhash'),

		make: text('make'),
		model: text('model'),
		lens: text('lens'),
		focalLength: integer('focal_length'),
		aperture: text('aperture'),
		iso: integer('iso'),
		shutterSpeed: text('shutter_speed'),
		takenAt: integer('taken_at', { mode: 'timestamp' }),

		isVisible: integer('is_visible', { mode: 'boolean' }).default(true),
		createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`)
	},
	(table) => [index('taken_at_idx').on(table.takenAt)]
);

export const tags = sqliteTable('tags', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),

	name: text('name').unique().notNull(),
	slug: text('slug').unique().notNull()
});

export const photosToTags = sqliteTable(
	'photos_to_tags',
	{
		photoId: text('photo_id')
			.notNull()
			.references(() => photos.id, { onDelete: 'cascade' }),

		tagId: text('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.photoId, t.tagId] })]
);

export const photosRelations = relations(photos, ({ many }) => ({
	tags: many(photosToTags)
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	photos: many(photosToTags)
}));

export const photosToTagsRelations = relations(photosToTags, ({ one }) => ({
	photo: one(photos, {
		fields: [photosToTags.photoId],
		references: [photos.id]
	}),
	tag: one(tags, {
		fields: [photosToTags.tagId],
		references: [tags.id]
	})
}));

export * from './auth.schema';
