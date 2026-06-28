<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'> &
			({ type: 'file'; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		'data-slot': dataSlot = 'input',
		...restProps
	}: Props = $props();
</script>

{#if type === 'file'}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			'h-8 w-full min-w-0 rounded-sm border border-neutral-200 bg-[#FAF9F5]/40 px-3 text-xs tracking-wide transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:bg-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive/50 dark:border-neutral-800/80 dark:bg-neutral-950/20 dark:placeholder:text-neutral-600 dark:focus-visible:border-neutral-600 dark:focus-visible:bg-neutral-950',
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			'h-8 w-full min-w-0 rounded-sm border border-neutral-200 bg-[#FAF9F5]/40 px-3 text-xs tracking-wide transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:bg-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive/50 dark:border-neutral-800/80 dark:bg-neutral-950/20 dark:placeholder:text-neutral-600 dark:focus-visible:border-neutral-600 dark:focus-visible:bg-neutral-950',
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}

