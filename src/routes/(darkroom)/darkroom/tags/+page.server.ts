import { getTags } from '$lib/remotes/tags.remote';

export const load = async () => {
	const tags = await getTags();
	return { tags };
};
