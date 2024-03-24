<script lang="ts">
	import { RangeSlider } from "@skeletonlabs/skeleton";

    export let selectionCount: number;
    export let minSelectionCount = 3;
    export let maxSelectionCount = 6;
</script>

<RangeSlider class="relative mb-6" name="selection-count" bind:value={selectionCount} min={minSelectionCount} max={maxSelectionCount} ticked step={1}>
    <div class="flex justify-between items-center">
        <div class="font-bold">Number of cards per voting round:
        <span class="font-normal pl-2 text-2xl">{selectionCount}</span></div>
        <div class="absolute -bottom-6">{minSelectionCount}</div>
        <div class="absolute -bottom-6 right-0">{maxSelectionCount}</div>
    </div>
</RangeSlider>