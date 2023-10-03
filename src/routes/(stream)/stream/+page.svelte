<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import type { Draft } from '$lib/snap/draft.js';
	import { onMount } from 'svelte';

    export let data;

    $: current_draft = data.draft;
    $: choice1 = data.choice?.card1;
    $: choice2 = data.choice?.card2;
    $: choice3 = data.choice?.card3;

	onMount(() => {
		setInterval(() => invalidateAll(), 5000)
	});
</script>

<svelte:head>
	<title>oro's chat draft - Stream</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

<div class="p-4">
	<div class="grid grid-cols-3 p-4">
		{#if choice1 && choice2 && choice3}
			<SnapCard card={choice1}/>
			<SnapCard card={choice2}/>
			<SnapCard card={choice3}/>
			<div class="text-center text-6xl">1</div>
			<div class="text-center text-6xl">2</div>
			<div class="text-center text-6xl">3</div>
		{:else if !current_draft?.cards}
			Loading...
		{/if}
	</div>
	<SnapDeck cards={current_draft?.cards || []} />
</div>
