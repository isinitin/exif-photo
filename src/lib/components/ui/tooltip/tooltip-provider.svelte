<script lang="ts">
	let { children, ...restProps }: { children?: any; [key: string]: any } = $props();
</script>

{@render children?.()}
