import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { APIError } from 'better-auth/api';
import { getDb } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';

export const signUp = command(
	v.object({ name: v.string(), email: v.string(), password: v.string() }),
	async ({ name, email, password }) => {
		const event = getRequestEvent()!;
		const { auth } = event.locals;

		const db = getDb(event.platform!.env.DB);
		const existing = await db.select({ id: user.id }).from(user).limit(1);
		if (existing.length > 0) {
			throw new Error('Registration is not allowed');
		}
		try {
			await auth.api.signUpEmail({ body: { name, email, password } });
		} catch (error) {
			if (error instanceof APIError) {
				throw new Error(error.message || 'This email is already registered');
			}
			console.error(error);
			throw new Error('Registration failed, please try again later');
		}
		return { success: true };
	}
);
