<script lang="ts">
	import { Tooltip } from '@ark-ui/svelte/tooltip';
	import { Portal } from '@ark-ui/svelte/portal';
	import { cn } from '$lib/utils.js';
	import { getContext } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		side = 'top',
		children,
		portalProps,
		...restProps
	}: {
		ref?: any;
		class?: string;
		sideOffset?: number;
		side?: 'top' | 'right' | 'bottom' | 'left';
		children?: any;
		portalProps?: any;
		[key: string]: any;
	} = $props();

	let positioningState = getContext<{ placement?: string; offset?: any }>('tooltip-positioning');

	$effect(() => {
		if (positioningState) {
			positioningState.placement = side;
			positioningState.offset = { mainAxis: sideOffset };
		}
	});
</script>

<Portal {...portalProps}>
	<Tooltip.Positioner class="z-50 pointer-events-none">
		<Tooltip.Content
			bind:ref
			data-slot="tooltip-content"
			class={cn(
				'pointer-events-auto z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-sm bg-neutral-900 px-2.5 py-1 text-[10px] font-medium text-white shadow-xs transition-opacity duration-150 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 dark:bg-neutral-50 dark:text-neutral-950',
				className
			)}
			{...restProps}
		>
			{@render children?.()}
			<Tooltip.Arrow class="[--arrow-background:theme(colors.neutral.900)] dark:[--arrow-background:theme(colors.neutral.50)]">
				<Tooltip.ArrowTip />
			</Tooltip.Arrow>
		</Tooltip.Content>
	</Tooltip.Positioner>
</Portal>
