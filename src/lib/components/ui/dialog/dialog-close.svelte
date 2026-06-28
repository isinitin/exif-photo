<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';

	let {
		ref = $bindable(null),
		type = 'button',
		...restProps
	}: { ref?: any; type?: 'button' | 'submit' | 'reset'; [key: string]: any } = $props();
</script>

<Dialog.CloseTrigger bind:ref data-slot="dialog-close" {type} {...restProps} />
