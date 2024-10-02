<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton';
	export let label: string;
	export let name: string;
	export let checked: boolean;
</script>

<div class="align-super">
	<span class="font-bold inline-block align-top mt-1">{label}</span>
	<SlideToggle on:change {name} bind:checked {...$$restProps} />
</div>
