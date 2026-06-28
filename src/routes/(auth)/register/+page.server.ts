import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) throw new Error('D1 binding "DB" not found');

	const db = getDb(platform.env.DB);
	const existing = await db.select({ id: user.id }).from(user).limit(1);

	if (existing.length > 0) {
		redirect(302, '/login');
	}
};
