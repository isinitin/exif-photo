<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils.js';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		'data-slot': dataSlot = 'textarea',
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		'flex field-sizing-content min-h-16 w-full resize-none rounded-sm border border-neutral-200 bg-[#FAF9F5]/40 px-3 py-2 text-xs tracking-wide transition-all outline-none placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:bg-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive/50 dark:border-neutral-800/80 dark:bg-neutral-950/20 dark:placeholder:text-neutral-600 dark:focus-visible:border-neutral-600 dark:focus-visible:bg-neutral-950',
		className
	)}
	bind:value
	{...restProps}
></textarea>

