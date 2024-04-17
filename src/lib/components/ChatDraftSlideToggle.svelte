<script lang="ts">
	import { SlideToggle } from '@skeletonlabs/skeleton';
	export let label: string;
	export let name: string;
</script>

<div class="align-super">
	<span class="font-bold inline-block align-top mt-1">{label}</span>
	<SlideToggle on:change {name} {...$$restProps} />
</div>
