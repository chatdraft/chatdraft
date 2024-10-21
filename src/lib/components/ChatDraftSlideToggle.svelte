<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton';
	export let label: string | undefined = undefined;
	export let name: string;
	export let checked: boolean;
</script>

<div class="align-super">
	{#if label}
		<span class="font-bold inline-block align-top mt-1">{label}</span>
	{/if}
	<SlideToggle on:change {name} bind:checked {...$$restProps} />
</div>
