<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { IconLoader2 } from '@tabler/icons-svelte-runes';
	import { deletePhoto } from '$lib/remotes/photos.remote';
	import type { PageData } from './$types';

	type Photo = PageData['photos'][number];

	let {
		open = $bindable(false),
		photo,
		onDeleted
	}: {
		open: boolean;
		photo: Photo | null;
		onDeleted: (id: string) => void;
	} = $props();

	let deleteLoading = $state(false);

	async function handleDelete() {
		if (!photo) return;
		deleteLoading = true;
		try {
			await deletePhoto({ id: photo.id });
			onDeleted(photo.id);
			open = false;
		} catch {
			open = false;
		} finally {
			deleteLoading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-xs">
		<Dialog.Header>
			<Dialog.Title>Delete photo?</Dialog.Title>
			<Dialog.Description>
				This will permanently remove the photo from storage and cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={deleteLoading}>
				Cancel
			</Button>
			<Button variant="destructive" onclick={handleDelete} disabled={deleteLoading}>
				{#if deleteLoading}
					<IconLoader2 size={14} class="animate-spin" />
				{/if}
				Delete
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
