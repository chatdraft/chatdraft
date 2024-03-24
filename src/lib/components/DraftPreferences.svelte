<script lang="ts">
	import { RangeSlider, SlideToggle } from "@skeletonlabs/skeleton";

    export let duration: number
    export let selectionCount: number;
    export let subsExtraVote: boolean;
</script>

<h3 class="h3">
    Default Draft Preferences
</h3>
<div class="p-4">
    <RangeSlider name="duration" bind:value={duration} min={30} max={180} ticked step={30}>
        <div class="flex justify-between items-center">
            <div class="font-bold">Voting period</div>
            <div class="text-xs">{(Math.floor(duration/60)).toLocaleString(undefined, {maximumFractionDigits: 0})}:{(duration%60).toLocaleString(undefined, {minimumIntegerDigits: 2})}</div>
        </div>
    </RangeSlider>
</div>
<div class="p-4">
    <RangeSlider name="selectionCount" bind:value={selectionCount} min={3} max={6} ticked step={1}>
        <div class="flex justify-between items-center">
            <div class="font-bold">Number of cards per voting round</div>
            <div class="text-xs">{selectionCount}</div>
        </div>
    </RangeSlider>
</div>
<div class="p-4">
    <SlideToggle name="subsExtraVote" bind:checked={subsExtraVote} active="bg-primary-500">+1 to Subscriber votes</SlideToggle>
</div>