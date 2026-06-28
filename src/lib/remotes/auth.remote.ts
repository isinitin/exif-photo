import { getRequestEvent, query } from '$app/server';
import { redirect } from '@sveltejs/kit';

async function getSession() {
	const event = getRequestEvent();
	return event.locals.auth.api.getSession({ headers: event.request.headers });
}

export const requireAuth = query(async () => {
	const session = await getSession();
	if (!session?.user) redirect(302, '/login');
	return session.user;
});
