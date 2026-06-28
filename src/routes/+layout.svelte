<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onNavigate } from '$app/navigation';
	import { navigationTracker } from '$lib/navigation.svelte';

	let { children } = $props();

	navigationTracker.init();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		const fromRoute = navigation.from?.route?.id;
		const toRoute = navigation.to?.route?.id;

		// Only transition between homepage and detail page
		const isHomeToDetail = fromRoute === '/' && toRoute === '/photo/[id]';
		const isDetailToHome = fromRoute === '/photo/[id]' && toRoute === '/';

		if (!isHomeToDetail && !isDetailToHome) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
