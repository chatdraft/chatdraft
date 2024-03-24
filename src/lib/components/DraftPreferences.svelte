<script lang="ts">
	import { SlideToggle } from "@skeletonlabs/skeleton";
	import DurationSlider from "./DurationSlider.svelte";
	import SelectionCountSlider from "./SelectionCountSlider.svelte";

    export let duration: number
    export let selectionCount: number;
    export let subsExtraVote: boolean;
</script>

<h3 class="h3">
    Default Draft Preferences
</h3>
<div class="p-4">
    <DurationSlider bind:duration />
</div>
<div class="p-4">
    <SelectionCountSlider bind:selectionCount />
</div>
<div class="p-4">
    <SlideToggle name="subsExtraVote" bind:checked={subsExtraVote} active="bg-primary-500">+1 to Subscriber votes</SlideToggle>
</div>