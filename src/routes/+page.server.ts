import { getPhotos } from '$lib/remotes/photos.remote';
import { getTags } from '$lib/remotes/tags.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [photos, tags] = await Promise.all([getPhotos(), getTags()]);

	return {
		photos,
		tags
	};
};
