<script lang="ts">
	import { RangeSlider } from "@skeletonlabs/skeleton";

    export let duration: number;
    export let minDuration = 30;
    export let maxDuration = 180;
</script>

<RangeSlider class="relative mb-6" label="duration" name="duration-range" bind:value={duration} min={minDuration} max={maxDuration} ticked step={30}>
    <div class="flex justify-between items-center">
        <div class="font-bold">
            Voting period:
            <span class="font-normal pl-2 text-2xl">{duration} s</span></div>
            <div class="absolute -bottom-6">{minDuration}</div>
            <div class="absolute -bottom-6 right-0">{maxDuration}</div>
    </div>
</RangeSlider>