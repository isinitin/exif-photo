import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

// Proxy route for serving R2 objects in local development.
// In production, configure R2_PUBLIC_URL in wrangler.jsonc to a public domain
// bound to your R2 bucket and this route will never be hit.
export const GET: RequestHandler = async ({ params, platform }) => {
	const obj = await platform!.env.BUCKET.get(params.path);
	if (!obj) throw error(404, 'Not found');

	const headers = new Headers();
	if (obj.httpMetadata?.contentType) {
		headers.set('Content-Type', obj.httpMetadata.contentType);
	}
	headers.set('Cache-Control', 'public, max-age=31536000, immutable');

	return new Response(obj.body, { headers });
};
