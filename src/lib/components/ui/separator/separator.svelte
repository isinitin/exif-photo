<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		orientation = 'horizontal',
		'data-slot': dataSlot = 'separator',
		...restProps
	}: {
		ref?: any;
		class?: string;
		orientation?: 'horizontal' | 'vertical';
		'data-slot'?: string;
		[key: string]: any;
	} = $props();
</script>

<div
	bind:this={ref}
	role="separator"
	data-slot={dataSlot}
	data-orientation={orientation}
	class={cn(
		'shrink-0 bg-neutral-200/60 dark:bg-neutral-800/60 data-[orientation=horizontal]:h-[0.5px] data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[0.5px]',
		'data-[orientation=vertical]:self-stretch',
		className
	)}
	{...restProps}
></div>
