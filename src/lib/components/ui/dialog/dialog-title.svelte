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
	data-slot="dialog-title"
	class={cn('text-sm font-medium text-black dark:text-white tracking-wide', className)}
	{...restProps}
/>
