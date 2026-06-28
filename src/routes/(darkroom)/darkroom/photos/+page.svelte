<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import {
		IconPhoto,
		IconUpload,
		IconTrash,
		IconCamera,
		IconPencil
	} from '@tabler/icons-svelte-runes';
	import { untrack } from 'svelte';

	import UploadDialog from './ppload-dialog.svelte';
	import EditDialog from './edit-dialog.svelte';
	import DeleteDialog from './delete-dialog.svelte';

	let { data }: { data: PageData } = $props();

	type Photo = (typeof data.photos)[number];
	type Tag = (typeof data.tags)[number];

	let photoList = $state<Photo[]>(untrack(() => [...data.photos]));
	let allTags = $derived(data.tags as Tag[]);

	// ── Dialog states ──────────────────────────────────────────────────────────
	let uploadOpen = $state(false);

	let editOpen = $state(false);
	let editingPhoto = $state<Photo | null>(null);

	let deleteOpen = $state(false);
	let deletingPhoto = $state<Photo | null>(null);

	function openEdit(photo: Photo) {
		editingPhoto = photo;
		editOpen = true;
	}

	function openDelete(photo: Photo) {
		deletingPhoto = photo;
		deleteOpen = true;
	}

	// ── Helpers ────────────────────────────────────────────────────────────────
	function formatDate(date: Date | null): string {
		if (!date) return '';
		return new Date(date).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Photos · Darkroom</title>
</svelte:head>

<div class="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
	<!-- Page header -->
	<div class="mb-8 flex items-center justify-between gap-4">
		<div>
			<h1 class="text-lg font-semibold tracking-tight text-foreground">Photos</h1>
			<p class="mt-0.5 text-xs text-muted-foreground">
				{photoList.length}
				{photoList.length === 1 ? 'photo' : 'photos'}
			</p>
		</div>
		<Button size="sm" onclick={() => (uploadOpen = true)}>
			<IconUpload size={14} />
			Upload
		</Button>
	</div>

	<!-- Empty state -->
	{#if photoList.length === 0}
		<div class="py-20 text-center">
			<div
				class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-border bg-muted/40"
			>
				<IconPhoto size={20} stroke={1.5} class="text-muted-foreground" />
			</div>
			<p class="text-sm font-medium text-foreground">No photos yet</p>
			<p class="mt-1 text-xs text-pretty text-muted-foreground">
				Upload your first photo to get started
			</p>
			<Button class="mt-5" variant="outline" size="sm" onclick={() => (uploadOpen = true)}>
				<IconUpload size={13} />
				Upload photos
			</Button>
		</div>

		<!-- Photo grid -->
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{#each photoList as photo (photo.id)}
				<div class="group relative overflow-hidden rounded-lg bg-muted/40">
					<div class="aspect-3/2 overflow-hidden">
						<img
							src={photo.url}
							alt={photo.title ?? ''}
							class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
							loading="lazy"
						/>
					</div>
					<!-- Overlay: gradient always on mobile, full dark on desktop hover -->
					<div
						class="absolute inset-0 flex flex-col justify-between bg-linear-to-t from-black/60 via-transparent to-black/30 p-2 sm:bg-black/0 sm:bg-none sm:transition-colors sm:duration-200 sm:group-hover:bg-black/50"
					>
						<!-- Top: action buttons — always visible on mobile, hover-only on desktop -->
						<div
							class="flex justify-end gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
						>
							<button
								onclick={() => openEdit(photo)}
								class="rounded-md bg-black/50 p-2.5 text-white transition-colors hover:bg-white/20 sm:p-1.5"
								aria-label="Edit photo"
							>
								<IconPencil size={13} />
							</button>
							<button
								onclick={() => openDelete(photo)}
								class="rounded-md bg-black/50 p-2.5 text-white transition-colors hover:bg-red-600 sm:p-1.5"
								aria-label="Delete photo"
							>
								<IconTrash size={13} />
							</button>
						</div>
						<!-- Bottom: metadata — always visible on mobile, hover-only on desktop -->
						<div class="sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
							{#if photo.model}
								<p class="flex items-center gap-1 truncate text-[10px] font-medium text-white/90">
									<IconCamera size={10} />
									{photo.model}
								</p>
							{/if}
							{#if photo.takenAt}
								<p class="mt-0.5 text-[10px] text-white/70">{formatDate(photo.takenAt)}</p>
							{/if}
							{#if photo.tags.length > 0}
								<div class="mt-1 flex flex-wrap gap-0.5">
									{#each photo.tags as t}
										<span class="rounded bg-white/20 px-1 py-0.5 text-[9px] text-white/80">
											{t.tag.name}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<UploadDialog
	bind:open={uploadOpen}
	onUploadComplete={(photo) => (photoList = [photo, ...photoList])}
/>

<EditDialog
	bind:open={editOpen}
	photo={editingPhoto}
	{allTags}
	onSaved={(updated) => {
		photoList = photoList.map((p) => (p.id === updated.id ? updated : p));
	}}
/>

<DeleteDialog
	bind:open={deleteOpen}
	photo={deletingPhoto}
	onDeleted={(id) => {
		photoList = photoList.filter((p) => p.id !== id);
	}}
/>
