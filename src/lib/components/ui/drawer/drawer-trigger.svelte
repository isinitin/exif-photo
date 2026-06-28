<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		asChild: asChildProp,
		children,
		...restProps
	}: {
		ref?: any;
		asChild?: Snippet<[any]>;
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

{#if asChildProp}
	<Dialog.Trigger bind:ref data-slot="drawer-trigger" {...restProps}>
		{#snippet asChild(attrs)}
			{@render asChildProp(attrs)}
		{/snippet}
	</Dialog.Trigger>
{:else}
	<Dialog.Trigger bind:ref data-slot="drawer-trigger" {...restProps}>
		{@render children?.()}
	</Dialog.Trigger>
{/if}
