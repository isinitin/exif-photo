<script lang="ts" module>
	import { cn } from '$lib/utils.js';

	const baseClass = 'gap-2 rounded-md text-xs/relaxed flex items-center shadow-none';
	
	const sizeClasses = {
		xs: "h-5 gap-1 rounded-[calc(var(--radius-sm)-2px)] px-1 [&>svg:not([class*='size-'])]:size-3",
		sm: 'gap-1',
		'icon-xs': 'size-6 p-0 has-[>svg]:p-0',
		'icon-sm': 'size-7 p-0 has-[>svg]:p-0'
	};

	export type InputGroupButtonSize = keyof typeof sizeClasses;

	export function inputGroupButtonVariants(options?: { size?: InputGroupButtonSize }): string {
		const size = options?.size ?? 'xs';
		return cn(baseClass, sizeClasses[size]);
	}
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		type = 'button',
		variant = 'ghost',
		size = 'xs',
		...restProps
	}: Omit<ComponentProps<typeof Button>, 'href' | 'size'> & {
		size?: InputGroupButtonSize;
	} = $props();
</script>

<Button
	bind:ref
	{type}
	data-size={size}
	{variant}
	class={cn(inputGroupButtonVariants({ size }), className)}
	{...restProps}
>
	{@render children?.()}
</Button>
