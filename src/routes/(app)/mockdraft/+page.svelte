<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import type { Draft } from '$lib/snap/draft.js';
	// import { onMount } from 'svelte';

	export let data;

	$: current_draft = data.draft;
	$: choice1 = data.choice?.card1!;
	$: choice2 = data.choice?.card2!;
	$: choice3 = data.choice?.card3!;

	// onMount(() => {

	// });

	async function NewDraft() {
		const ret = await fetch('/api/v1/draft/Player', { method: 'PUT' });
		invalidateAll();
	}

	async function DraftCard(cardNumber: number) {
		const ret = await fetch(`/api/v1/draft/Player/choice/${cardNumber}`, { method: 'PUT' });
		invalidateAll();
	}
</script>

<svelte:head>
	<title>oro's chat draft - Mock Draft</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

<div class="space-y-4 p-4">
	<h1>Mock Draft</h1>
	<button type="button" class="btn btn-lg variant-filled" on:click={NewDraft}>New Draft</button><br
	/>
	{@debug choice1, choice2, choice3}
	{#if choice1 && choice2 && choice3}
		Please select from:

		<section class="grid grid-cols-3 p-4 justify-items-center">
			<SnapCard card={choice1} />
			<SnapCard card={choice2} />
			<SnapCard card={choice3} />
			<button
				type="button"
				class="btn btn-md variant-outline-primary p-4 w-1/2"
				on:click={() => DraftCard(1)}>Select</button
			>
			<button
				type="button"
				class="btn btn-md variant-outline-primary p-4 w-1/2"
				on:click={() => DraftCard(2)}>Select</button
			>
			<button
				type="button"
				class="btn btn-md variant-outline-primary p-4 w-1/2"
				on:click={() => DraftCard(3)}>Select</button
			>
		</section>
		<SnapDeck cards={current_draft?.cards || []} />
	{:else if current_draft?.cards}
		<SnapDeck cards={current_draft?.cards} />
		*insert draft code here once*
	{:else}
		Please start a new draft.
	{/if}
</div>
