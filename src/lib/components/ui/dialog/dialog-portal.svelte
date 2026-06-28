<script lang="ts">
	import { Portal } from '@ark-ui/svelte/portal';

	let { children, ...restProps }: { children?: any; [key: string]: any } = $props();
</script>

<Portal {...restProps}>
	{@render children?.()}
</Portal>
