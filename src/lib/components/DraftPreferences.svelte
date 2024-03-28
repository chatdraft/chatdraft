<script lang="ts">
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import DurationSlider from './DurationSlider.svelte';
  import SelectionCountSlider from './SelectionCountSlider.svelte';

  export let duration: number;
  export let selectionCount: number;
  export let subsExtraVote: boolean;
</script>
