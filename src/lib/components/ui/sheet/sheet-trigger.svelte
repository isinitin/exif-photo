<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';

	let {
		ref = $bindable(null),
		...restProps
	}: { ref?: any; [key: string]: any } = $props();
</script>

<Dialog.Trigger bind:ref data-slot="sheet-trigger" {...restProps} />
