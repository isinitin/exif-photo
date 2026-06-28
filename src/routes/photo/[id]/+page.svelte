<script lang="ts">
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import ExifInfo from '$lib/components/exif-info.svelte';
	import { navigationTracker } from '$lib/navigation.svelte';

	let { data }: { data: PageData } = $props();

	let photo = $derived(data.photo);
	let prevId = $derived(data.prevId);
	let nextId = $derived(data.nextId);
	let prevPhoto = $derived(data.prevPhoto);
	let nextPhoto = $derived(data.nextPhoto);

	// ─── SEO ─────────────────────────────────────────────────────────────────────
	let photoTitle = $derived(photo.title || 'Abiee');
	let pageTitle = $derived(photoTitle);
	let photoDescription = $derived(
		photo.description ||
			[
				photo.make,
				photo.model,
				photo.lens,
				photo.focalLength ? `${photo.focalLength}mm` : null,
				photo.aperture,
				photo.shutterSpeed,
				photo.iso ? `ISO ${photo.iso}` : null
			]
				.filter(Boolean)
				.join(' · ')
	);
	let siteUrl = $derived(page.url.origin);
	let ogImageUrl = $derived(
		`${siteUrl}/og?title=${encodeURIComponent(photoTitle)}&description=${encodeURIComponent(photoDescription)}&image=${encodeURIComponent(photo.url)}`
	);
	let structuredData = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'ImageObject',
			name: photoTitle,
			description: photoDescription,
			contentUrl: photo.url,
			width: photo.width,
			height: photo.height,
			...(photo.takenAt && { dateCreated: new Date(photo.takenAt).toISOString() }),
			exifData: [
				photo.make && { '@type': 'PropertyValue', name: 'cameraMake', value: photo.make },
				photo.model && { '@type': 'PropertyValue', name: 'cameraModel', value: photo.model },
				photo.lens && { '@type': 'PropertyValue', name: 'lens', value: photo.lens },
				photo.focalLength && {
					'@type': 'PropertyValue',
					name: 'focalLength',
					value: `${photo.focalLength}mm`
				},
				photo.aperture && { '@type': 'PropertyValue', name: 'fNumber', value: photo.aperture },
				photo.iso && { '@type': 'PropertyValue', name: 'isoSpeed', value: String(photo.iso) },
				photo.shutterSpeed && {
					'@type': 'PropertyValue',
					name: 'exposureTime',
					value: photo.shutterSpeed
				}
			].filter(Boolean),
			isPartOf: { '@type': 'ImageGallery', name: 'Lensy', url: siteUrl }
		})
	);

	// ─── Gallery ──────────────────────────────────────────────────────────────────
	let scrollerEl: HTMLElement | null = $state(null);

	// Guard against scrollend firing again while SvelteKit navigation is in flight
	let isNavigating = false;

	// Mouse drag-to-swipe state
	let isDragging = $state(false);
	let startX = 0;
	let startScrollLeft = 0;

	// Whenever the photo changes (SvelteKit soft-nav), snap back to center slot instantly
	$effect(() => {
		if (!scrollerEl) return;
		void photo.id; // reactive dependency
		isNavigating = false;
		scrollerEl.scrollTo({ left: scrollerEl.clientWidth, behavior: 'instant' });
	});

	// Wire scrollend via addEventListener — avoids TS attr issues with newer DOM events
	$effect(() => {
		const el = scrollerEl;
		if (!el) return;

		// Center on mount
		el.scrollTo({ left: el.clientWidth, behavior: 'instant' });

		function onScrollEnd() {
			if (isNavigating || !el || isDragging) return;
			const vw = el.clientWidth;
			const { scrollLeft } = el;
			if (scrollLeft < vw * 0.5) {
				isNavigating = true;
				goto(`/photo/${prevId}`, { replaceState: true });
			} else if (scrollLeft > vw * 1.5) {
				isNavigating = true;
				goto(`/photo/${nextId}`, { replaceState: true });
			}
		}

		el.addEventListener('scrollend', onScrollEnd);
		return () => el.removeEventListener('scrollend', onScrollEnd);
	});

	function handlePointerDown(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		if (e.button !== 0 || !scrollerEl) return;

		isDragging = true;
		startX = e.pageX;
		startScrollLeft = scrollerEl.scrollLeft;

		scrollerEl.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging || !scrollerEl) return;
		const dx = e.pageX - startX;
		scrollerEl.scrollLeft = startScrollLeft - dx;
	}

	function handlePointerUp(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		if (!isDragging || !scrollerEl) return;
		isDragging = false;
		scrollerEl.releasePointerCapture(e.pointerId);

		const dx = e.pageX - startX;
		const threshold = Math.min(150, scrollerEl.clientWidth * 0.15);
		if (dx < -threshold) {
			isNavigating = true;
			goto(`/photo/${nextId}`, { replaceState: true });
		} else if (dx > threshold) {
			isNavigating = true;
			goto(`/photo/${prevId}`, { replaceState: true });
		} else {
			// Smooth scroll back to center
			scrollerEl.scrollTo({ left: scrollerEl.clientWidth, behavior: 'smooth' });
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') goto(`/photo/${nextId}`, { replaceState: true });
		else if (e.key === 'ArrowLeft') goto(`/photo/${prevId}`, { replaceState: true });
		else if (e.key === 'Escape') {
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={photoDescription} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={photoDescription} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:type" content="article" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={photoDescription} />
	<meta name="twitter:image" content={ogImageUrl} />
	<script type="application/ld+json">
		{structuredData}
	</script>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div
	class="relative h-dvh w-full font-sans text-[#111] antialiased bg-[#FDFBF7]"
>
	<!-- Back button -->
	<header
		class="pointer-events-none absolute top-0 right-0 left-0 z-50 flex items-center p-6"
	>
		<a
			href="/"
			onclick={(e) => {
				if (navigationTracker.hasPreviousSession) {
					e.preventDefault();
					history.back();
				}
			}}
			class="group pointer-events-auto text-[11px] font-bold tracking-[0.2em] text-black/40 hover:text-black transition-colors uppercase flex items-center"
		>
			<span class="mr-2 transform transition-transform group-hover:-translate-x-1 duration-300">←</span>
			Gallery
		</a>
	</header>

	<!--
		CSS Scroll Snap strip: [prev | current | next]
		Starts scrolled to center (scrollLeft = clientWidth).
		scrollend detects which slot won and calls goto().
	-->
	<div
		bind:this={scrollerEl}
		class="gallery-scroller h-full w-full {isDragging ? 'is-dragging' : ''}"
		role="region"
		aria-label="Photo gallery"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
	>
		<!-- Prev slot -->
		<div class="gallery-slot">
			<img
				src={prevPhoto.url}
				alt={prevPhoto.title}
				width={prevPhoto.width}
				height={prevPhoto.height}
				loading="eager"
				draggable="false"
				class="max-h-[calc(100dvh-12rem)] max-w-full object-contain lg:max-h-[calc(100dvh-14rem)]"
			/>
		</div>

		<!-- Current slot -->
		<div class="gallery-slot">
			<img
				src={photo.url}
				alt={photo.title}
				width={photo.width}
				height={photo.height}
				draggable="false"
				style="view-transition-name: photo-{photo.id};"
				class="max-h-[calc(100dvh-12rem)] max-w-full object-contain lg:max-h-[calc(100dvh-14rem)]"
			/>
		</div>

		<!-- Next slot -->
		<div class="gallery-slot">
			<img
				src={nextPhoto.url}
				alt={nextPhoto.title}
				width={nextPhoto.width}
				height={nextPhoto.height}
				loading="eager"
				draggable="false"
				class="max-h-[calc(100dvh-12rem)] max-w-full object-contain lg:max-h-[calc(100dvh-14rem)]"
			/>
		</div>
	</div>

	<!-- Desktop nav arrows -->
	<a
		href={`/photo/${prevId}`}
		data-sveltekit-replacestate
		class="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-black/10 bg-white/60 backdrop-blur-md text-black/60 hover:text-black hover:bg-white hover:border-black/20 hover:scale-105 active:scale-95 transition-all duration-300"
		aria-label="Previous photo"
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-5 w-5">
			<path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</a>

	<a
		href={`/photo/${nextId}`}
		data-sveltekit-replacestate
		class="absolute right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-black/10 bg-white/60 backdrop-blur-md text-black/60 hover:text-black hover:bg-white hover:border-black/20 hover:scale-105 active:scale-95 transition-all duration-300"
		aria-label="Next photo"
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-5 w-5">
			<path d="M9 19l7-7-7-7" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</a>

	<!-- EXIF overlay -->
	<ExifInfo {photo} isZoomed={false} />
</div>

<style>
	.gallery-scroller {
		display: flex;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;
		overscroll-behavior-x: contain;
		touch-action: pan-x;
		scrollbar-width: none;
		user-select: none;
		-webkit-user-select: none;
		cursor: grab;
	}

	.gallery-scroller.is-dragging {
		scroll-snap-type: none;
		scroll-behavior: auto;
		cursor: grabbing;
	}

	.gallery-scroller img {
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
	}

	.gallery-scroller::-webkit-scrollbar {
		display: none;
	}

	.gallery-slot {
		flex: 0 0 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem 1rem 7rem;
		scroll-snap-align: center;
		scroll-snap-stop: always;
	}

	@media (min-width: 1024px) {
		.gallery-slot {
			padding: 6rem 6rem 8rem;
		}
	}
</style>
