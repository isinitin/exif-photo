import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { photos } from '$lib/server/db/schema';
import { json, error } from '@sveltejs/kit';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']);

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const session = await locals.auth.api.getSession({ headers: request.headers });
	if (!session) throw error(401, 'Unauthorized');

	const formData = await request.formData();
	const file = formData.get('file');
	const exifJson = formData.get('exif');

	if (!(file instanceof File) || file.size === 0) throw error(400, 'No file provided');
	if (file.size > MAX_SIZE) throw error(400, 'File too large (max 100 MB)');
	if (!ALLOWED_TYPES.has(file.type)) throw error(400, 'Unsupported file type');

	let exif: Record<string, unknown> = {};
	if (typeof exifJson === 'string') {
		try {
			exif = JSON.parse(exifJson);
		} catch {
			exif = {};
		}
	}

	const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
	const key = `photos/${crypto.randomUUID()}.${ext}`;

	const buffer = await file.arrayBuffer();
	await platform!.env.BUCKET.put(key, buffer, {
		httpMetadata: { contentType: file.type }
	});

	const R2_PUBLIC_URL = (platform!.env as Env & { R2_PUBLIC_URL?: string }).R2_PUBLIC_URL ?? '';
	const url = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : `/media/${key}`;

	const db = getDb(platform!.env.DB);
	const [photo] = await db
		.insert(photos)
		.values({
			key,
			url,
			width: safeInt(exif.width) ?? 0,
			height: safeInt(exif.height) ?? 0,
			make: safeStr(exif.make),
			model: safeStr(exif.model),
			lens: safeStr(exif.lens),
			focalLength: safeInt(exif.focalLength),
			aperture: safeStr(exif.aperture),
			iso: safeInt(exif.iso),
			shutterSpeed: safeStr(exif.shutterSpeed),
			takenAt: safeStr(exif.takenAt) ? new Date(exif.takenAt as string) : null
		})
		.returning();

	return json(photo);
};

function safeStr(v: unknown): string | undefined {
	return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function safeInt(v: unknown): number | undefined {
	const n = parseInt(String(v), 10);
	return isNaN(n) ? undefined : n;
}
