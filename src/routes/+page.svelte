<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { navigationTracker } from '$lib/navigation.svelte';

	let { data }: { data: PageData } = $props();

	const pageTitle = 'Abiee — Editorial Photography Gallery';
	const pageDescription =
		'Shapes in Light — An editorial curation of visual storytelling. Capturing brutalist horizons, delicate glass layers, and the profound depth of human stillness.';

	let ogImageUrl = $derived(
		`${page.url.origin}/og?title=${encodeURIComponent(pageTitle)}&description=${encodeURIComponent(pageDescription)}${data.photos.length > 0 ? `&image=${encodeURIComponent(data.photos[0].url)}` : ''}`
	);

	// Tag filtering
	type TagItem = PageData['tags'][number];
	type PhotoItem = PageData['photos'][number];
	type PhotoTagItem = PhotoItem['tags'][number];

	let activeTag = $derived(page.url.searchParams.get('tag'));
	let tagsWithPhotos = $derived(data.tags.filter((t: TagItem) => t.photoCount > 0));
	let filteredPhotos = $derived(
		activeTag
			? data.photos.filter((p: PhotoItem) =>
					p.tags.some((t: PhotoTagItem) => t.tag.slug === activeTag)
				)
			: data.photos
	);
	let activeTagName = $derived(
		activeTag ? tagsWithPhotos.find((t: TagItem) => t.slug === activeTag)?.name : null
	);
	let photoCount = $derived(filteredPhotos.length);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:card" content="summary_large_image" />

	<!-- Structured Data: ImageGallery -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ImageGallery',
		name: 'Lensy — Shapes in Light',
		description: pageDescription,
		image: data.photos.slice(0, 5).map((p: PageData['photos'][number]) => ({
			'@type': 'ImageObject',
			contentUrl: p.url,
			name: p.title || 'Untitled',
			description:
				p.description ||
				`${p.make || ''} ${p.model || ''} · ${p.focalLength}mm ${p.aperture}`.trim()
		}))
	})}</script>`}
</svelte:head>

<div class="min-h-dvh overflow-x-hidden bg-[#FAFAF8] text-[#1a1a1a] antialiased selection:bg-black/10">
	<main class="relative z-10 mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16">
		<!-- Header: Brand + Navigation -->
		<header class="flex flex-col gap-10 pt-20 pb-14 md:pt-28 md:pb-20">
			<div class="flex flex-col gap-1">
				<a
					href="/"
					class="text-4xl font-light tracking-tight text-[#111] transition-opacity hover:opacity-70 md:text-5xl"
				>
					Abiee
				</a>
				<p class="mt-2 text-sm font-light tracking-wide text-[#999]">
					Shapes in Light — Editorial Photography
				</p>
			</div>

			{#if tagsWithPhotos.length > 0}
				<nav
					class="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] tracking-wide"
					aria-label="Filter by tag"
				>
					<a href="/" class="tag-link {!activeTag ? 'tag-link--active' : ''}">
						All
						{#if !activeTag}
							<span class="tag-count">{photoCount}</span>
						{/if}
					</a>
					{#each tagsWithPhotos as tag}
						<a href="/?tag={tag.slug}" class="tag-link {activeTag === tag.slug ? 'tag-link--active' : ''}">
							{tag.name}
							{#if activeTag === tag.slug}
								<span class="tag-count">{photoCount}</span>
							{/if}
						</a>
					{/each}
				</nav>
			{/if}
		</header>

		<!-- Gallery Grid -->
		{#if filteredPhotos.length > 0}
			<section
				class="columns-1 gap-5 pb-24 sm:columns-2 lg:columns-3 xl:columns-4"
				class:skip-stagger={navigationTracker.cameFromPhotoDetail}
				aria-label="Photography collection"
			>
				{#each filteredPhotos as photo, i (photo.id)}
					<div class="grid-item" style="--stagger: {i}">
						<a href="/photo/{photo.id}" class="group block">
							<div 
								class="relative overflow-hidden rounded-sm bg-black/2"
								style="aspect-ratio: {photo.width} / {photo.height};"
							>
								<img
									src={photo.url}
									alt={photo.title || 'Photography'}
									width={photo.width}
									height={photo.height}
									loading="lazy"
									style="view-transition-name: photo-{photo.id};"
									class="block h-auto w-full transition-transform duration-[0.6s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.03]"
								/>
								<!-- Hover overlay -->
								<div class="absolute inset-0 flex items-end bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
									{#if photo.title}
										<span class="p-4 text-sm font-light text-white/95">
											{photo.title}
										</span>
									{/if}
								</div>
							</div>
						</a>
					</div>
				{/each}
			</section>
		{:else}
			<!-- Empty state -->
			<div class="flex min-h-[40vh] items-center justify-center pb-24">
				<p class="text-sm font-light tracking-wide text-[#bbb]">
					{#if activeTagName}
						No photos in {activeTagName}
					{:else}
						No photos yet
					{/if}
				</p>
			</div>
		{/if}
	</main>
</div>

<style>
	/* Tag navigation links */
	.tag-link {
		position: relative;
		color: #999;
		font-weight: 400;
		transition: color 0.25s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.tag-link:hover {
		color: #555;
	}

	.tag-link--active {
		color: #1a1a1a;
		font-weight: 500;
	}

	.tag-count {
		font-size: 11px;
		color: #c0c0c0;
		font-weight: 400;
	}

	/* Masonry grid items */
	.grid-item {
		margin-bottom: 1.25rem;
		break-inside: avoid;
		opacity: 0;
		animation: grid-fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
		animation-delay: calc(var(--stagger) * 0.06s);
	}

	@keyframes grid-fade-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.skip-stagger) .grid-item {
		opacity: 1 !important;
		animation: none !important;
		animation-delay: 0s !important;
	}
</style>
