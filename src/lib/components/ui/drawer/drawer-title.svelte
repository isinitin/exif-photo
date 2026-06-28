<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: { ref?: any; class?: string; [key: string]: any } = $props();
</script>

<Dialog.Title
	bind:ref
	data-slot="drawer-title"
	class={cn('text-sm font-semibold tracking-widest text-black/60 uppercase', className)}
	{...restProps}
/>
