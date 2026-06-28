<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import { IconLoader2, IconTag, IconCheck } from '@tabler/icons-svelte-runes';
	import { updatePhoto } from '$lib/remotes/photos.remote';
	import type { PageData } from './$types';

	type Photo = PageData['photos'][number];
	type Tag = PageData['tags'][number];

	let {
		open = $bindable(false),
		photo,
		allTags,
		onSaved
	}: {
		open: boolean;
		photo: Photo | null;
		allTags: Tag[];
		onSaved: (photo: Photo) => void;
	} = $props();

	let editSaving = $state(false);
	let editError = $state('');

	// Form fields
	let eTitle = $state('');
	let eDescription = $state('');
	let eMake = $state('');
	let eModel = $state('');
	let eLens = $state('');
	let eFocalLength = $state('');
	let eAperture = $state('');
	let eIso = $state('');
	let eShutterSpeed = $state('');
	let eTakenAt = $state('');
	let eIsVisible = $state(true);
	let eTagIds = $state<string[]>([]);

	$effect(() => {
		if (open && photo) {
			eTitle = photo.title ?? '';
			eDescription = photo.description ?? '';
			eMake = photo.make ?? '';
			eModel = photo.model ?? '';
			eLens = photo.lens ?? '';
			eFocalLength = photo.focalLength != null ? String(photo.focalLength) : '';
			eAperture = photo.aperture ?? '';
			eIso = photo.iso != null ? String(photo.iso) : '';
			eShutterSpeed = photo.shutterSpeed ?? '';
			eTakenAt = photo.takenAt ? new Date(photo.takenAt).toISOString().slice(0, 16) : '';
			eIsVisible = photo.isVisible ?? true;
			eTagIds = photo.tags.map((t) => t.tagId);
			editError = '';
		}
	});

	function toggleTag(tagId: string) {
		if (eTagIds.includes(tagId)) {
			eTagIds = eTagIds.filter((id) => id !== tagId);
		} else {
			eTagIds = [...eTagIds, tagId];
		}
	}

	async function handleSave() {
		if (!photo) return;
		editSaving = true;
		editError = '';
		try {
			const updated = await updatePhoto({
				id: photo.id,
				title: eTitle || null,
				description: eDescription || null,
				make: eMake || null,
				model: eModel || null,
				lens: eLens || null,
				focalLength: eFocalLength ? parseInt(eFocalLength, 10) : null,
				aperture: eAperture || null,
				iso: eIso ? parseInt(eIso, 10) : null,
				shutterSpeed: eShutterSpeed || null,
				takenAt: eTakenAt ? new Date(eTakenAt).toISOString() : null,
				isVisible: eIsVisible,
				tagIds: eTagIds
			});

			const tagObjects = eTagIds.map((tagId) => ({
				tagId,
				photoId: updated.id,
				tag: allTags.find((t) => t.id === tagId)!
			}));

			onSaved({ ...updated, tags: tagObjects } as Photo);
			open = false;
		} catch (e) {
			editError = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			editSaving = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="flex h-[90dvh] flex-col gap-0 p-0 sm:max-w-lg">
		<Dialog.Header class="border-b border-border px-5 py-4">
			<Dialog.Title>Edit photo</Dialog.Title>
			<Dialog.Description>Update EXIF metadata and tags.</Dialog.Description>
		</Dialog.Header>

		{#if photo}
			<div class="flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-5">
				<!-- Thumbnail -->
				<div class="aspect-3/2 overflow-hidden rounded-lg bg-muted/40">
					<img src={photo.url} alt="" class="size-full object-cover" />
				</div>

				<!-- Info section -->
				<section>
					<p class="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
						Info
					</p>
					<div class="space-y-2.5">
						<div class="flex flex-col gap-1">
							<label for="edit-title" class="text-xs text-muted-foreground">Title</label>
							<Input id="edit-title" bind:value={eTitle} placeholder="Untitled" />
						</div>
						<div class="flex flex-col gap-1">
							<label for="edit-desc" class="text-xs text-muted-foreground">Description</label>
							<Textarea
								id="edit-desc"
								bind:value={eDescription}
								placeholder="Add a description…"
								rows={3}
							/>
						</div>
						<div class="flex items-center gap-2">
							<Switch id="edit-visible" bind:checked={eIsVisible} size="sm" />
							<label for="edit-visible" class="cursor-pointer text-xs">Visible</label>
						</div>
					</div>
				</section>

				<!-- EXIF section -->
				<section>
					<p class="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
						Camera
					</p>
					<div class="grid grid-cols-2 gap-2.5">
						<div class="flex flex-col gap-1">
							<label for="edit-make" class="text-xs text-muted-foreground">Make</label>
							<Input id="edit-make" bind:value={eMake} placeholder="e.g. Sony" />
						</div>
						<div class="flex flex-col gap-1">
							<label for="edit-model" class="text-xs text-muted-foreground">Model</label>
							<Input id="edit-model" bind:value={eModel} placeholder="e.g. A7 IV" />
						</div>
						<div class="col-span-2 flex flex-col gap-1">
							<label for="edit-lens" class="text-xs text-muted-foreground">Lens</label>
							<Input id="edit-lens" bind:value={eLens} placeholder="e.g. FE 24-70mm F2.8" />
						</div>
					</div>
				</section>

				<section>
					<p class="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
						Exposure
					</p>
					<div class="grid grid-cols-2 gap-2.5">
						<div class="flex flex-col gap-1">
							<label for="edit-focal" class="text-xs text-muted-foreground">Focal length (mm)</label
							>
							<Input
								id="edit-focal"
								type="number"
								bind:value={eFocalLength}
								placeholder="50"
								min="1"
							/>
						</div>
						<div class="flex flex-col gap-1">
							<label for="edit-aperture" class="text-xs text-muted-foreground">Aperture</label>
							<Input id="edit-aperture" bind:value={eAperture} placeholder="f/1.8" />
						</div>
						<div class="flex flex-col gap-1">
							<label for="edit-iso" class="text-xs text-muted-foreground">ISO</label>
							<Input id="edit-iso" type="number" bind:value={eIso} placeholder="400" min="1" />
						</div>
						<div class="flex flex-col gap-1">
							<label for="edit-ss" class="text-xs text-muted-foreground">Shutter speed</label>
							<Input id="edit-ss" bind:value={eShutterSpeed} placeholder="1/200" />
						</div>
						<div class="col-span-2 flex flex-col gap-1">
							<label for="edit-takenat" class="text-xs text-muted-foreground">Date taken</label>
							<Input id="edit-takenat" type="datetime-local" bind:value={eTakenAt} />
						</div>
					</div>
				</section>

				<!-- Tags section -->
				<section>
					<p class="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
						Tags
					</p>
					{#if allTags.length === 0}
						<p class="flex items-center gap-1.5 text-xs text-muted-foreground">
							<IconTag size={12} />
							No tags yet — create some in the Tags page.
						</p>
					{:else}
						<div class="flex flex-wrap gap-1.5">
							{#each allTags as tag (tag.id)}
								{@const selected = eTagIds.includes(tag.id)}
								<button
									type="button"
									onclick={() => toggleTag(tag.id)}
									class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors
										{selected
										? 'border-primary bg-primary text-primary-foreground'
										: 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'}"
								>
									{#if selected}
										<IconCheck size={10} />
									{/if}
									{tag.name}
								</button>
							{/each}
						</div>
					{/if}
				</section>

				{#if editError}
					<p class="text-xs text-destructive">{editError}</p>
				{/if}
			</div>

			<Dialog.Footer class="border-t border-border px-5 py-4">
				<Button variant="outline" onclick={() => (open = false)} disabled={editSaving}>
					Cancel
				</Button>
				<Button onclick={handleSave} disabled={editSaving}>
					{#if editSaving}
						<IconLoader2 size={14} class="animate-spin" />
					{/if}
					Save
				</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
