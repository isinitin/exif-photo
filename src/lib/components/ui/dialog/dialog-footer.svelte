<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Dialog } from '@ark-ui/svelte/dialog';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		showCloseButton = false,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		showCloseButton?: boolean;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="dialog-footer"
	class={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
	{...restProps}
>
	{@render children?.()}
	{#if showCloseButton}
		<Dialog.CloseTrigger>
			{#snippet asChild(props)}
				<Button variant="outline" {...props()}>Close</Button>
			{/snippet}
		</Dialog.CloseTrigger>
	{/if}
</div>
