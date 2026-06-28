<script lang="ts">
	import { fade } from 'svelte/transition';
	import { IconMenu, IconAperture, IconClock, IconFocus2 } from '@tabler/icons-svelte-runes';
	import * as Drawer from '$lib/components/ui/drawer';
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';

	let { photo, isZoomed }: { photo: any; isZoomed: boolean } = $props();

	let tags = $derived(
		(photo?.tags as { tag: { id: string; name: string; slug: string } }[] | undefined) ?? []
	);

	let open = $derived(!!(page.state as App.PageState).exifDrawer);

	function openDrawer() {
		pushState('', { exifDrawer: true });
	}

	function onOpenChange(value: boolean) {
		if (!value && (page.state as App.PageState).exifDrawer) {
			replaceState('', {});
		}
	}
</script>

{#if !isZoomed && photo}
	<div
		transition:fade={{ duration: 300 }}
		class="pointer-events-none absolute right-0 bottom-0 left-0 z-50 flex justify-center px-4 pb-8"
	>
		<div class="pointer-events-auto w-full max-w-5xl text-[#111] transition-all">
			<!-- Desktop Layout -->
			<div class="hidden justify-center md:flex">
				<div
					class="flex items-center gap-4 text-[10px] font-mono tracking-widest text-black/40 uppercase"
				>
					<span>{photo.focalLength ? `${photo.focalLength}mm` : '-'}</span>
					<span>/</span>
					<span>ƒ/{photo.aperture?.replace('f/', '') || '-'}</span>
					<span>/</span>
					<span>{photo.shutterSpeed || '-'}s</span>
					<span>/</span>
					<span>ISO {photo.iso || '-'}</span>
					{#if photo.make || photo.model}
						<span>/</span>
						<span>{photo.make || ''} {photo.model || ''}</span>
					{/if}
					{#if photo.lens}
						<span>/</span>
						<span class="max-w-48 truncate" title={photo.lens}>{photo.lens}</span>
					{/if}
					{#if tags.length > 0}
						<span>/</span>
						<div class="flex items-center gap-2">
							{#each tags as { tag } (tag.id)}
								<a
									href="/?tag={tag.slug}"
									class="text-black/40 hover:text-black hover:underline transition-colors lowercase font-mono"
									onclick={(e) => e.stopPropagation()}
								>
									#{tag.name}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Mobile Layout Trigger -->
			<div class="flex justify-center md:hidden">
				<Drawer.Root {open} {onOpenChange}>
					<Drawer.Trigger>
						{#snippet asChild(props)}
							<button
								{...props()}
								onclick={openDrawer}
								class="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-5 py-2.5 text-[11px] font-medium tracking-wide text-black/60 backdrop-blur-xl transition-colors hover:bg-white/90 hover:text-black/80"
							>
								<IconMenu size={13} class="stroke-2" />
								Metadata
							</button>
						{/snippet}
					</Drawer.Trigger>
					<Drawer.Content class="rounded-t-3xl border-0 bg-[#F3EBE1] p-0 before:hidden">
						<Drawer.Header class="pb-4">
							<Drawer.Title
								class="text-left text-sm font-semibold tracking-widest text-black/60 uppercase"
								>Metadata</Drawer.Title
							>
						</Drawer.Header>
						{#if tags.length > 0}
							<div class="flex flex-wrap gap-1.5 px-4 pb-4">
								{#each tags as { tag } (tag.id)}
									<a
										href="/?tag={tag.slug}"
										class="rounded-full border border-black/15 bg-white/60 px-3 py-1 text-[11px] font-medium text-black/50 transition-colors hover:bg-white"
									>
										{tag.name}
									</a>
								{/each}
							</div>
						{/if}
						<div class="grid grid-cols-2 gap-3 px-4 pb-10">
							<!-- Aperture -->
							<div class="flex aspect-square flex-col justify-between rounded-2xl bg-white p-5">
								<span class="text-[10px] font-bold tracking-widest text-black/40 uppercase"
									>Aperture</span
								>
								<div class="text-2xl font-medium text-black">
									ƒ/{photo.aperture?.replace('f/', '') || '-'}
								</div>
								<IconAperture size={24} class="stroke-[1.5] text-black/40" />
							</div>
							<!-- Shutter Speed -->
							<div class="flex aspect-square flex-col justify-between rounded-2xl bg-white p-5">
								<span class="text-[10px] font-bold tracking-widest text-black/40 uppercase"
									>Shutter Speed</span
								>
								<div class="text-2xl font-medium text-black">{photo.shutterSpeed || '-'}s</div>
								<IconClock size={24} class="stroke-[1.5] text-black/40" />
							</div>
							<!-- Focal Length -->
							<div class="flex aspect-square flex-col justify-between rounded-2xl bg-white p-5">
								<span class="text-[10px] font-bold tracking-widest text-black/40 uppercase"
									>Focal Length</span
								>
								<div class="text-2xl font-medium text-black">
									{photo.focalLength ? `${photo.focalLength}mm` : '-'}
								</div>
								<IconFocus2 size={24} class="stroke-[1.5] text-black/40" />
							</div>
							<!-- ISO -->
							<div class="flex aspect-square flex-col justify-between rounded-2xl bg-white p-5">
								<span class="text-[10px] font-bold tracking-widest text-black/40 uppercase"
									>ISO</span
								>
								<div class="text-2xl font-medium text-black">{photo.iso || '-'}</div>
								<div
									class="w-fit rounded-lg border-2 border-black/30 px-1 py-0.5 text-[10px] font-bold text-black/40"
								>
									ISO
								</div>
							</div>
						</div>
					</Drawer.Content>
				</Drawer.Root>
			</div>
		</div>
	</div>
{/if}
