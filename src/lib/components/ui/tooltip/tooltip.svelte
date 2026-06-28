<script lang="ts">
	import { Tooltip } from '@ark-ui/svelte/tooltip';
	import { setContext } from 'svelte';

	let {
		open = $bindable(false),
		openDelay = 200,
		closeDelay = 200,
		...restProps
	}: {
		open?: boolean;
		openDelay?: number;
		closeDelay?: number;
		[key: string]: any;
	} = $props();

	let positioningState = $state<any>({});
	setContext('tooltip-positioning', positioningState);
</script>

<Tooltip.Root bind:open {openDelay} {closeDelay} positioning={positioningState} {...restProps} />
