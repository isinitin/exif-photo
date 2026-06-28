<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';

	let {
		open = $bindable(false),
		lazyMount = true,
		unmountOnExit = true,
		...restProps
	}: {
		open?: boolean;
		lazyMount?: boolean;
		unmountOnExit?: boolean;
		[key: string]: any;
	} = $props();
</script>

<Dialog.Root bind:open {lazyMount} {unmountOnExit} {...restProps} />
