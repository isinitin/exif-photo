<script lang="ts">
	import { Tooltip } from '@ark-ui/svelte/tooltip';

	let { ref = $bindable(null), ...restProps }: { ref?: any; [key: string]: any } = $props();
</script>

<Tooltip.Trigger bind:ref data-slot="tooltip-trigger" {...restProps} />
