<script lang="ts">
	import { Switch } from '@ark-ui/svelte/switch';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		size = 'default',
		disabled = false,
		id,
		...restProps
	}: {
		ref?: any;
		class?: string;
		checked?: boolean;
		size?: 'sm' | 'default';
		disabled?: boolean;
		id?: string;
		[key: string]: any;
	} = $props();
</script>

<Switch.Root
	bind:checked
	{disabled}
	{id}
	class={cn(
		'peer inline-flex items-center gap-2 cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50 group/switch',
		className
	)}
	{...restProps}
>
	<Switch.Control
		bind:ref
		class="inline-flex shrink-0 items-center rounded-full border border-neutral-200 bg-neutral-100 transition-colors p-[1.5px] outline-none group-data-[state=checked]/switch:bg-black group-data-[state=checked]/switch:border-black dark:border-neutral-800 dark:bg-neutral-900 dark:group-data-[state=checked]/switch:bg-white dark:group-data-[state=checked]/switch:border-white group-data-[size=default]/switch:h-[16px] group-data-[size=default]/switch:w-[28px] group-data-[size=sm]/switch:h-[13px] group-data-[size=sm]/switch:w-[22px]"
		data-size={size}
	>
		<Switch.Thumb
			class="pointer-events-none block rounded-full bg-white transition-transform shadow-xs dark:bg-neutral-950 group-data-[size=default]/switch:size-[11.5px] group-data-[size=sm]/switch:size-[8.5px] group-data-[state=checked]/switch:translate-x-full group-data-[state=unchecked]/switch:translate-x-0"
		/>
	</Switch.Control>
	<Switch.HiddenInput />
</Switch.Root>
