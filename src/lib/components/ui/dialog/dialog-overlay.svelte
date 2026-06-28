<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: { ref?: any; class?: string; [key: string]: any } = $props();
</script>

<Dialog.Backdrop bind:ref {...restProps}>
	{#snippet asChild(attrs)}
		<div
			{...attrs()}
			data-slot="dialog-overlay"
			class={cn(
				'fixed inset-0 isolate z-50 bg-black/30 backdrop-blur-xs duration-200 data-open:animate-in data-open:fade-in data-closed:animate-out data-closed:fade-out',
				className
			)}
		></div>
	{/snippet}
</Dialog.Backdrop>
