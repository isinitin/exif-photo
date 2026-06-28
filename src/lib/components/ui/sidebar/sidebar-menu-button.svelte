<script lang="ts" module>
	import { cn } from '$lib/utils.js';

	const baseClass = 'ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground gap-2 rounded-[calc(var(--radius-sm)+2px)] p-2 text-left text-xs transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate';
	
	const variantClasses = {
		default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
		outline: 'bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]'
	};

	const sizeClasses = {
		default: 'h-8 text-xs',
		sm: 'h-7 text-xs',
		lg: 'h-12 text-xs group-data-[collapsible=icon]:p-0!'
	};

	export type SidebarMenuButtonVariant = keyof typeof variantClasses;
	export type SidebarMenuButtonSize = keyof typeof sizeClasses;

	export function sidebarMenuButtonVariants(options?: { variant?: SidebarMenuButtonVariant; size?: SidebarMenuButtonSize }): string {
		const variant = options?.variant ?? 'default';
		const size = options?.size ?? 'default';
		return cn(baseClass, variantClasses[variant], sizeClasses[size]);
	}
</script>

<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { type WithElementRef, type WithoutChildrenOrChild } from '$lib/utils.js';
	import type { ComponentProps, Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useSidebar } from './context.svelte.js';

	function mergeProps(a: any, b: any) {
		const result = { ...a, ...b };
		if (a && b) {
			if (a.class && b.class) {
				result.class = cn(a.class, b.class);
			}
			for (const key of Object.keys(result)) {
				if (key.startsWith('on') && typeof a[key] === 'function' && typeof b[key] === 'function') {
					result[key] = (...args: any[]) => {
						a[key](...args);
						b[key](...args);
					};
				}
			}
		}
		return result;
	}

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		variant = 'default',
		size = 'default',
		isActive = false,
		tooltipContent,
		tooltipContentProps,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
		isActive?: boolean;
		variant?: SidebarMenuButtonVariant;
		size?: SidebarMenuButtonSize;
		tooltipContent?: Snippet | string;
		tooltipContentProps?: WithoutChildrenOrChild<ComponentProps<typeof Tooltip.Content>>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const sidebar = useSidebar();

	const buttonProps = $derived({
		class: cn(sidebarMenuButtonVariants({ variant, size }), className),
		'data-slot': 'sidebar-menu-button',
		'data-sidebar': 'menu-button',
		'data-size': size,
		'data-active': isActive,
		...restProps
	});
</script>

{#snippet Button({ props }: { props?: Record<string, unknown> })}
	{@const mergedProps = mergeProps(buttonProps, props)}
	{#if child}
		{@render child({ props: mergedProps })}
	{:else}
		<button bind:this={ref} {...mergedProps}>
			{@render children?.()}
		</button>
	{/if}
{/snippet}

{#if !tooltipContent}
	{@render Button({})}
{:else}
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet asChild(props: any)}
				{@render Button({ props: props() })}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content
			side="right"
			align="center"
			hidden={sidebar.state !== 'collapsed' || sidebar.isMobile}
			{...tooltipContentProps}
		>
			{#if typeof tooltipContent === 'string'}
				{tooltipContent}
			{:else if tooltipContent}
				{@render tooltipContent()}
			{/if}
		</Tooltip.Content>
	</Tooltip.Root>
{/if}
