import { defineEnvVars } from '@sveltejs/kit/hooks';
import * as v from 'valibot';

export const variables = defineEnvVars({
	CLOUDFLARE_ACCOUNT_ID: {
		schema: v.string()
	},
	CLOUDFLARE_DATABASE_ID: {
		schema: v.string()
	},
	CLOUDFLARE_D1_TOKEN: {
		schema: v.string()
	},
	BETTER_AUTH_SECRET: {
		schema: v.string()
	}
});
