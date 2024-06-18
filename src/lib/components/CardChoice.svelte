<script lang="ts">
	import SnapCard from '$lib/components/SnapCard.svelte';
	import VoteCounter from '$lib/components/VoteCounter.svelte';
	import type { Card } from '$lib/snap/cards';

	export let blur: boolean;
	export let choice: Card;
	export let index: number;
	export let votes: number;
	export let battlerSelected: boolean;
	export let viewerProfilePicture: string | undefined;
	export let currentWinner: boolean;
</script>

<div
	class="bg-black outline outline-2 rounded-lg shadow-md shadow-black/100 relative bg-opacity-70 outline-white"
	class:glow={currentWinner}
	class:glow-yellow-500={currentWinner}
	class:blur
>
	<!-- Selection Value-->
	<span class="font-bold text-8xl flex items-center absolute top-0 left-0 bottom-0 m-auto">
		{index + 1}
	</span>

	<!-- Vote Icon & Number of Votes-->
	<VoteCounter {votes} {battlerSelected} {viewerProfilePicture} />

	<!-- Card Image -->
	<div><SnapCard hideDescription={true} hideName={true} card={choice} /></div>
</div>
