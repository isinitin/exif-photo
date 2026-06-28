import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { APIError } from 'better-auth/api';

export const signIn = command(
	v.object({ email: v.string(), password: v.string() }),
	async ({ email, password }) => {
		const { auth } = getRequestEvent()!.locals;
		try {
			await auth.api.signInEmail({ body: { email, password } });
		} catch (error) {
			if (error instanceof APIError) {
				throw new Error(error.message || 'Invalid email or password');
			}
			throw new Error('Sign in failed, please try again later');
		}
		return { success: true };
	}
);
