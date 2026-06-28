import { command, getRequestEvent, query } from '$app/server';
import { getDb } from '$lib/server/db';
import { tags, photosToTags } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import * as v from 'valibot';
import { requireAuth } from './auth.remote';

function toSlug(name: string): string {
	// Decompose accented Latin chars (é → e + combining mark), then strip combining marks
	const decomposed = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
	const slug = decomposed
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		// Keep Unicode letters (any script: CJK, Arabic, Cyrillic…) and numbers; strip the rest
		.replace(/[^\p{L}\p{N}-]/gu, '')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
	// Fallback: if name contains no slug-able chars (e.g. pure punctuation), use a random ID
	return slug || Math.random().toString(36).slice(2, 10);
}

export const getTags = query(async () => {
	const event = getRequestEvent();
	const db = getDb(event.platform!.env.DB);
	return db
		.select({
			id: tags.id,
			name: tags.name,
			slug: tags.slug,
			photoCount: sql<number>`count(${photosToTags.tagId})`
		})
		.from(tags)
		.leftJoin(photosToTags, eq(tags.id, photosToTags.tagId))
		.groupBy(tags.id)
		.all();
});

export const createTag = command(
	v.object({
		name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Name is required'), v.maxLength(50))
	}),
	async ({ name }) => {
		await requireAuth();
		const event = getRequestEvent();
		const db = getDb(event.platform!.env.DB);
		const slug = toSlug(name);
		const [tag] = await db.insert(tags).values({ name: name.trim(), slug }).returning();
		return tag;
	}
);

export const updateTag = command(
	v.object({
		id: v.string(),
		name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Name is required'), v.maxLength(50))
	}),
	async ({ id, name }) => {
		await requireAuth();
		const event = getRequestEvent();
		const db = getDb(event.platform!.env.DB);
		const slug = toSlug(name);
		const [tag] = await db
			.update(tags)
			.set({ name: name.trim(), slug })
			.where(eq(tags.id, id))
			.returning();
		return tag;
	}
);

export const deleteTag = command(v.object({ id: v.string() }), async ({ id }) => {
	await requireAuth();
	const event = getRequestEvent();
	const db = getDb(event.platform!.env.DB);
	await db.delete(tags).where(eq(tags.id, id));
});
