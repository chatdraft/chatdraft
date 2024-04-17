<script lang="ts">
	import { RangeSlider } from '@skeletonlabs/skeleton';

	export let bgOpacity: number;
	export let minOpacity = 0;
	export let maxOpacity = 100;
</script>

<div class="flex justify-between items-center">
	<div class="font-bold">
		Background Opacity: {bgOpacity}%
	</div>
</div>
<br />
<div class="flex pt-4">
	<div class="mx-3">
		{minOpacity}
	</div>
	<div class="w-10/12">
		<RangeSlider
			class="relative mb-6"
			label="bgOpacity"
			name="bgOpacity"
			bind:value={bgOpacity}
			min={minOpacity}
			max={maxOpacity}
			ticked
			step={10}
		/>
	</div>
	<div class="w-min pl-2">
		{maxOpacity}
	</div>
</div>
