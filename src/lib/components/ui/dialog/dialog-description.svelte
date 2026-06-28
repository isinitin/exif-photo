<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: { ref?: any; class?: string; [key: string]: any } = $props();
</script>

<Dialog.Description
	bind:ref
	data-slot="dialog-description"
	class={cn(
		'text-[11px] text-neutral-400 dark:text-neutral-500 tracking-wide *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
		className
	)}
	{...restProps}
/>
