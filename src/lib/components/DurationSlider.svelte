<script lang="ts">
	import { RangeSlider } from '@skeletonlabs/skeleton';

	export let duration: number;
	export let minDuration = 30;
	export let maxDuration = 180;
</script>

<div class="flex justify-between items-center pt-2">
	<div class="font-bold">
		Voting Period (seconds): {duration}
	</div>
</div>
<br />
<div class="flex pt-4">
	<div class="mx-2">{minDuration}</div>
	<div class="w-10/12">
		<RangeSlider
			class="relative mb-6"
			label="duration"
			name="duration"
			bind:value={duration}
			min={minDuration}
			max={maxDuration}
			ticked
			step={30}
		/>
	</div>
	<div class="w-1/12 pl-2">
		{maxDuration}
	</div>
</div>
