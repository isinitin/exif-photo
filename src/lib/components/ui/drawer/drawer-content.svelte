<script lang="ts">
	import { Dialog } from '@ark-ui/svelte/dialog';
	import { Portal } from '@ark-ui/svelte/portal';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import DrawerOverlay from './drawer-overlay.svelte';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		...restProps
	}: {
		ref?: any;
		class?: string;
		portalProps?: any;
		children: Snippet;
		[key: string]: any;
	} = $props();
</script>

<Portal {...portalProps}>
	<DrawerOverlay />
	<Dialog.Positioner class="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
		<Dialog.Content bind:ref {...restProps}>
			{#snippet asChild(attrs)}
				<div
					{...attrs()}
					data-slot="drawer-content"
					class={cn(
						'pointer-events-auto flex w-full max-w-xl flex-col rounded-t-3xl border-t border-neutral-200/50 bg-[#F3EBE1] pb-10 shadow-2xl outline-none dark:border-neutral-800 dark:bg-neutral-900 duration-300 ease-out data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom',
						className
					)}
				>
					<!-- Drag handle -->
					<div class="mx-auto my-3 h-1 w-12 shrink-0 rounded-full bg-black/10 dark:bg-white/10"></div>
					
					{@render children?.()}
				</div>
			{/snippet}
		</Dialog.Content>
	</Dialog.Positioner>
</Portal>
