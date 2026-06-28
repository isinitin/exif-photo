import { getPhotos } from '$lib/remotes/photos.remote';
import { getTags } from '$lib/remotes/tags.remote';

export const load = async () => {
	const [photos, tags] = await Promise.all([getPhotos(), getTags()]);
	return { photos, tags };
};
