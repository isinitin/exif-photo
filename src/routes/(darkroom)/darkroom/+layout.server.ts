import { requireAuth } from '$lib/remotes/auth.remote';

export const load = async () => {
	await requireAuth();
};
