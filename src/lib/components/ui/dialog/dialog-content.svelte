<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';
	import { Portal } from '@ark-ui/svelte/portal';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { IconX } from '@tabler/icons-svelte-runes';
	import DialogOverlay from './dialog-overlay.svelte';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		showCloseButton = true,
		...restProps
	}: {
		ref?: any;
		class?: string;
		portalProps?: any;
		children: Snippet;
		showCloseButton?: boolean;
		[key: string]: any;
	} = $props();
</script>

<Portal {...portalProps}>
	<DialogOverlay />
	<Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<Dialog.Content bind:ref {...restProps}>
			{#snippet asChild(attrs)}
				<div
					{...attrs()}
					data-slot="dialog-content"
					class={cn(
						'relative grid w-full max-w-md gap-4 rounded-sm border border-neutral-200 bg-white p-6 shadow-sm outline-none dark:border-neutral-800 dark:bg-neutral-950 text-xs tracking-wide duration-200 ease-out data-open:animate-in data-open:fade-in data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out data-closed:zoom-out-95',
						className
					)}
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
