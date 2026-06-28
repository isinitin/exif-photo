<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';

	let {
		open = $bindable(false),
		onOpenChange,
		...restProps
	}: {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		[key: string]: any;
	} = $props();
</script>

<Dialog.Root
	bind:open
	onOpenChange={(details) => {
		onOpenChange?.(details.open);
	}}
	{...restProps}
/>
