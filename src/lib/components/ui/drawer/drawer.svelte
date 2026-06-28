<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';

	let {
		open = $bindable(false),
		onOpenChange,
		lazyMount = true,
		unmountOnExit = true,
		...restProps
	}: {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		lazyMount?: boolean;
		unmountOnExit?: boolean;
		[key: string]: any;
	} = $props();
</script>

<Dialog.Root
	bind:open
	{lazyMount}
	{unmountOnExit}
	onOpenChange={(details) => {
		onOpenChange?.(details.open);
	}}
	{...restProps}
/>
