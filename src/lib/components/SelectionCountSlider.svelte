<script lang="ts">
	import { RangeSlider } from "@skeletonlabs/skeleton";

    export let selectionCount: number;
    export let minSelectionCount = 3;
    export let maxSelectionCount = 6;
</script>

<div class="flex justify-between items-center">
    <div class="font-bold">
        Choices per Voting Period: {selectionCount}
    </div>
</div>
<br/>
<div class="flex pt-4">
    <div class="mx-3">
        {minSelectionCount}
    </div>
    <div class="w-10/12">
        <RangeSlider
            class="relative mb-6" label="selectionCount" name="selectionCount" 
            bind:value={selectionCount} min={minSelectionCount} 
            max={maxSelectionCount} ticked step={1}>
        </RangeSlider>
    </div>
    <div class="w-min pl-2">
        {maxSelectionCount}
    </div>
</div>
