<script lang="ts">
	import type { PageData } from './$types';
	import { createTag, updateTag, deleteTag as deleteTagMutation } from '$lib/remotes/tags.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		IconTag,
		IconPlus,
		IconPencil,
		IconTrash,
		IconHash,
		IconLoader2
	} from '@tabler/icons-svelte-runes';
	import { untrack } from 'svelte';
	import { createForm } from '@tanstack/svelte-form';

	let { data }: { data: PageData } = $props();

	type Tag = { id: string; name: string; slug: string; photoCount: number };

	let tagList = $state<Tag[]>(untrack(() => [...(data.tags as Tag[])]));
	let sortedTags = $derived([...tagList].sort((a, b) => a.name.localeCompare(b.name)));

	function toSlug(name: string): string {
		const decomposed = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
		const slug = decomposed
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^\p{L}\p{N}-]/gu, '')
			.replace(/-+/g, '-')
			.replace(/^-+|-+$/g, '');
		return slug || '…';
	}

	// --- Create ---
	let createOpen = $state(false);
	let createError = $state('');

	const createTagForm = createForm(() => ({
		defaultValues: { name: '' },
		onSubmit: async ({ value }) => {
			createError = '';
			try {
				const tag = await createTag({ name: value.name });
				tagList = [...tagList, { ...tag, photoCount: 0 }];
				createTagForm.reset();
				createOpen = false;
			} catch (e) {
				createError = e instanceof Error ? e.message : 'Failed to create tag';
			}
		}
	}));

	// --- Edit ---
	let editOpen = $state(false);
	let editingTag = $state<Tag | null>(null);
	let editError = $state('');

	const editTagForm = createForm(() => ({
		defaultValues: { name: '' },
		onSubmit: async ({ value }) => {
			if (!editingTag) return;
			editError = '';
			try {
				const updated = await updateTag({ id: editingTag.id, name: value.name });
				tagList = tagList.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
				editOpen = false;
			} catch (e) {
				editError = e instanceof Error ? e.message : 'Failed to update tag';
			}
		}
	}));

	function openEdit(tag: Tag) {
		editingTag = tag;
		editTagForm.setFieldValue('name', tag.name);
		editError = '';
		editOpen = true;
	}

	// --- Delete ---
	let deleteOpen = $state(false);
	let deletingTag = $state<Tag | null>(null);
	let deleteLoading = $state(false);

	function openDeleteDialog(tag: Tag) {
		deletingTag = tag;
		deleteOpen = true;
	}

	async function handleDelete() {
		if (!deletingTag) return;
		deleteLoading = true;
		try {
			await deleteTagMutation({ id: deletingTag.id });
			tagList = tagList.filter((t) => t.id !== deletingTag!.id);
			deleteOpen = false;
		} catch {
			// silently close on error for now
			deleteOpen = false;
		} finally {
			deleteLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Tags · Darkroom</title>
</svelte:head>

<div class="mx-auto w-full max-w-2xl px-4 py-8 md:px-6 md:py-12">
	<!-- Page header -->
	<div class="mb-8 flex items-center justify-between gap-4">
		<div>
			<h1 class="text-lg font-semibold tracking-tight text-balance text-foreground">Tags</h1>
			<p class="mt-0.5 text-xs text-muted-foreground">
				{tagList.length}
				{tagList.length === 1 ? 'tag' : 'tags'}
			</p>
		</div>
		<Button size="sm" onclick={() => (createOpen = true)}>
			<IconPlus size={14} />
			New tag
		</Button>
	</div>

	<!-- Tag list -->
	{#if sortedTags.length === 0}
		<!-- Empty state -->
		<div class="py-20 text-center">
			<div
				class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-border bg-muted/40"
			>
				<IconTag size={20} stroke={1.5} class="text-muted-foreground" />
			</div>
			<p class="text-sm font-medium text-foreground">No tags yet</p>
			<p class="mt-1 text-xs text-pretty text-muted-foreground">
				Tags help you organize and filter your photos
			</p>
			<Button class="mt-5" variant="outline" size="sm" onclick={() => (createOpen = true)}>
				<IconPlus size={13} />
				Create your first tag
			</Button>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl border border-border/70 bg-card/50">
			{#each sortedTags as tag, i (tag.id)}
				<div
					class="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30
                 {i < sortedTags.length - 1 ? 'border-b border-border/50' : ''}"
				>
					<!-- Tag icon -->
					<div
						class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-foreground"
					>
						<IconHash size={13} stroke={2} />
					</div>

					<!-- Tag info -->
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-foreground">{tag.name}</p>
						<p class="truncate text-[11px] text-muted-foreground">{tag.slug}</p>
					</div>

					<!-- Right side: count + actions -->
					<div class="flex shrink-0 items-center gap-2">
						<span
							class="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums"
						>
							{tag.photoCount}
							{tag.photoCount === 1 ? 'photo' : 'photos'}
						</span>

						<div
							class="flex items-center gap-0.5 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
						>
							<Button
								size="icon-sm"
								variant="ghost"
								onclick={() => openEdit(tag)}
								aria-label="Edit {tag.name}"
							>
								<IconPencil size={13} />
							</Button>
							<Button
								size="icon-sm"
								variant="ghost"
								class="text-destructive hover:bg-destructive/10 hover:text-destructive"
								onclick={() => openDeleteDialog(tag)}
								aria-label="Delete {tag.name}"
							>
								<IconTrash size={13} />
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create dialog -->
<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="sm:max-w-xs">
		<Dialog.Header>
			<Dialog.Title>New tag</Dialog.Title>
			<Dialog.Description>Give your tag a name to organize your photos.</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				createTagForm.handleSubmit();
			}}
		>
			<div class="flex flex-col gap-3">
				<div class="flex flex-col gap-1.5">
					<createTagForm.Field name="name">
						{#snippet children(field)}
							<createTagForm.Subscribe selector={(state) => state.isSubmitting}>
								{#snippet children(isSubmitting)}
									<Input
										placeholder="e.g. Street, Portrait, Landscape"
										name={field.name}
										value={field.state.value}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										onblur={field.handleBlur}
										disabled={isSubmitting}
										autofocus
									/>
								{/snippet}
							</createTagForm.Subscribe>
							{#if field.state.value.trim()}
								<p class="text-[11px] text-muted-foreground">
									Slug: <span class="font-medium text-foreground">{toSlug(field.state.value)}</span>
								</p>
							{/if}
						{/snippet}
					</createTagForm.Field>
					{#if createError}
						<p class="text-[11px] text-destructive">{createError}</p>
					{/if}
				</div>

				<createTagForm.Subscribe
					selector={(state) => ({ isSubmitting: state.isSubmitting, values: state.values })}
				>
					{#snippet children(state)}
						<div class="flex justify-end gap-2">
							<Button
								variant="ghost"
								size="sm"
								type="button"
								onclick={() => (createOpen = false)}
								disabled={state.isSubmitting}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								type="submit"
								disabled={state.isSubmitting || !state.values.name.trim()}
							>
								{#if state.isSubmitting}
									<IconLoader2 size={13} class="animate-spin" />
								{/if}
								Create
							</Button>
						</div>
					{/snippet}
				</createTagForm.Subscribe>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit dialog -->
<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="sm:max-w-xs">
		<Dialog.Header>
			<Dialog.Title>Edit tag</Dialog.Title>
			<Dialog.Description>Update the tag name.</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				editTagForm.handleSubmit();
			}}
		>
			<div class="flex flex-col gap-3">
				<div class="flex flex-col gap-1.5">
					<editTagForm.Field name="name">
						{#snippet children(field)}
							<editTagForm.Subscribe selector={(state) => state.isSubmitting}>
								{#snippet children(isSubmitting)}
									<Input
										placeholder="Tag name"
										name={field.name}
										value={field.state.value}
										oninput={(e) => field.handleChange(e.currentTarget.value)}
										onblur={field.handleBlur}
										disabled={isSubmitting}
										autofocus
									/>
								{/snippet}
							</editTagForm.Subscribe>
							{#if field.state.value.trim()}
								<p class="text-[11px] text-muted-foreground">
									Slug: <span class="font-medium text-foreground">{toSlug(field.state.value)}</span>
								</p>
							{/if}
						{/snippet}
					</editTagForm.Field>
					{#if editError}
						<p class="text-[11px] text-destructive">{editError}</p>
					{/if}
				</div>

				<editTagForm.Subscribe
					selector={(state) => ({ isSubmitting: state.isSubmitting, values: state.values })}
				>
					{#snippet children(state)}
						<div class="flex justify-end gap-2">
							<Button
								variant="ghost"
								size="sm"
								type="button"
								onclick={() => (editOpen = false)}
								disabled={state.isSubmitting}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								type="submit"
								disabled={state.isSubmitting || !state.values.name.trim()}
							>
								{#if state.isSubmitting}
									<IconLoader2 size={13} class="animate-spin" />
								{/if}
								Save
							</Button>
						</div>
					{/snippet}
				</editTagForm.Subscribe>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete confirmation dialog -->
<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content class="sm:max-w-xs">
		<Dialog.Header>
			<Dialog.Title>Delete tag</Dialog.Title>
			<Dialog.Description>
				Delete <span class="font-medium text-foreground">"{deletingTag?.name}"</span>? This won't
				remove the photos, only the tag association.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex justify-end gap-2">
			<Button
				variant="ghost"
				size="sm"
				onclick={() => (deleteOpen = false)}
				disabled={deleteLoading}
			>
				Cancel
			</Button>
			<Button variant="destructive" size="sm" onclick={handleDelete} disabled={deleteLoading}>
				{#if deleteLoading}
					<IconLoader2 size={13} class="animate-spin" />
				{/if}
				Delete
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
