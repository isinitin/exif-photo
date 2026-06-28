<script lang="ts" module>
	export type Side = 'top' | 'right' | 'bottom' | 'left';
</script>

<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';
	import { Portal } from '@ark-ui/svelte/portal';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconX } from '@tabler/icons-svelte-runes';
	import SheetOverlay from './sheet-overlay.svelte';

	let {
		ref = $bindable(null),
		class: className,
		side = 'right',
		showCloseButton = true,
		portalProps,
		children,
		...restProps
	}: {
		ref?: any;
		class?: string;
		side?: Side;
		showCloseButton?: boolean;
		portalProps?: any;
		children: Snippet;
		[key: string]: any;
	} = $props();

	// Map side to positioner and content classes
	const positionerClasses = {
		right: 'fixed inset-y-0 right-0 z-50 flex h-full w-full justify-end pointer-events-none',
		left: 'fixed inset-y-0 left-0 z-50 flex h-full w-full justify-start pointer-events-none',
		top: 'fixed inset-x-0 top-0 z-50 flex w-full justify-center pointer-events-none',
		bottom: 'fixed inset-x-0 bottom-0 z-50 flex w-full justify-center pointer-events-none'
	};

	const contentClasses = {
		right: 'pointer-events-auto h-full w-3/4 max-w-sm border-l border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 duration-300 ease-out data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right',
		left: 'pointer-events-auto h-full w-3/4 max-w-sm border-r border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 duration-300 ease-out data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left',
		top: 'pointer-events-auto w-full border-b border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 duration-300 ease-out data-open:animate-in data-open:slide-in-from-top data-closed:animate-out data-closed:slide-out-to-top',
		bottom: 'pointer-events-auto w-full border-t border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 duration-300 ease-out data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom'
	};
</script>

<Portal {...portalProps}>
	<SheetOverlay />
	<Dialog.Positioner class={positionerClasses[side]}>
		<Dialog.Content bind:ref {...restProps}>
			{#snippet asChild(attrs)}
				<div
					{...attrs()}
					data-slot="sheet-content"
					data-side={side}
					class={cn(contentClasses[side], className)}
				>
					{@render children?.()}
					{#if showCloseButton}
						<Dialog.CloseTrigger>
							{#snippet asChild(closeAttrs)}
								<Button variant="ghost" size="icon-xs" class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900" {...closeAttrs()}>
									<IconX class="size-3.5" />
									<span class="sr-only">Close</span>
								</Button>
							{/snippet}
						</Dialog.CloseTrigger>
					{/if}
				</div>
			{/snippet}
		</Dialog.Content>
	</Dialog.Positioner>
</Portal>
