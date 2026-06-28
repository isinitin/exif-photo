import { command, getRequestEvent, query } from '$app/server';
import { getDb } from '$lib/server/db';
import { photos, photosToTags } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { requireAuth } from './auth.remote';

export const getPhotos = query(async () => {
	const event = getRequestEvent();
	const db = getDb(event.platform!.env.DB);
	return db.query.photos.findMany({
		with: { tags: { with: { tag: true } } },
		orderBy: [desc(photos.takenAt), desc(photos.createdAt)]
	});
});

export const getPhoto = query(v.string(), async (id: string) => {
	const event = getRequestEvent();
	const db = getDb(event.platform!.env.DB);
	return db.query.photos.findFirst({
		with: { tags: { with: { tag: true } } },
		where: eq(photos.id, id)
	});
});

const nullishString = v.nullish(v.string());
const nullishInt = v.nullish(v.pipe(v.number(), v.integer()));

export const updatePhoto = command(
	v.object({
		id: v.string(),
		title: nullishString,
		description: nullishString,
		make: nullishString,
		model: nullishString,
		lens: nullishString,
		focalLength: nullishInt,
		aperture: nullishString,
		iso: nullishInt,
		shutterSpeed: nullishString,
		takenAt: nullishString,
		isVisible: v.optional(v.boolean()),
		tagIds: v.array(v.string())
	}),
	async ({ id, tagIds, takenAt, isVisible, ...rest }) => {
		await requireAuth();
		const event = getRequestEvent();
		const db = getDb(event.platform!.env.DB);

		const [photo] = await db
			.update(photos)
			.set({
				...rest,
				isVisible: isVisible ?? true,
				takenAt: takenAt ? new Date(takenAt) : null,
				updatedAt: new Date()
			})
			.where(eq(photos.id, id))
			.returning();

		await db.delete(photosToTags).where(eq(photosToTags.photoId, id));
		if (tagIds.length > 0) {
			await db.insert(photosToTags).values(tagIds.map((tagId) => ({ photoId: id, tagId })));
		}

		return photo;
	}
);

export const deletePhoto = command(v.object({ id: v.string() }), async ({ id }) => {
	await requireAuth();
	const event = getRequestEvent();
	const db = getDb(event.platform!.env.DB);
	const [photo] = await db.delete(photos).where(eq(photos.id, id)).returning();
	if (photo?.key) {
		await event.platform!.env.BUCKET.delete(photo.key);
	}
});
