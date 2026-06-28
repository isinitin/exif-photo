import { getPhoto, getPhotos } from '$lib/remotes/photos.remote';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [photo, allPhotos] = await Promise.all([getPhoto(params.id), getPhotos()]);

	if (!photo) {
		error(404, 'Photo not found');
	}

	const index = allPhotos.findIndex((p) => p.id === params.id);
	const prevIndex = index > 0 ? index - 1 : allPhotos.length - 1;
	const nextIndex = index < allPhotos.length - 1 ? index + 1 : 0;
	const prevId = allPhotos[prevIndex].id;
	const nextId = allPhotos[nextIndex].id;
	const prevPhoto = allPhotos[prevIndex];
	const nextPhoto = allPhotos[nextIndex];

	return {
		photo,
		prevId,
		nextId,
		prevPhoto,
		nextPhoto
	};
};
