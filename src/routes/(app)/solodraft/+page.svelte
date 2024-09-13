<script lang="ts">
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { Draft } from '$lib/snap/draft.js';
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import cards from '$lib/data/cards.json';
	import SelectionCountSlider from '$lib/components/SelectionCountSlider.svelte';
	import { title } from '$lib/title';
	import DraftChoice from '$lib/components/DraftChoice.svelte';
	import DraftSummary from '$lib/components/DraftSummary.svelte';

	let selectionCount = 6;
	const gridcols = ['', '', '', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6'];

	let current_draft: Draft | null;
	$: choices = current_draft?.currentChoice?.cards;
	$: grid_layout = gridcols[current_draft?.selections || 6];

	async function NewDraft() {
		let current_cards = cards;
		const latestCardsReq = await fetch('api/v1/cards');
		if (latestCardsReq.ok) {
			current_cards = await latestCardsReq.json();
		}
		current_draft = new Draft('', 0, selectionCount, current_cards.all, undefined, null);
		await current_draft.StartDraft();

		current_draft = current_draft;
	}

	async function DraftCard(index: number) {
		console.log('hello');
		if (current_draft && choices) {
			await current_draft.Choose(choices[index].cardDefKey);
			current_draft = current_draft;
		}
	}

	async function CancelDraft() {
		if (current_draft) {
			await current_draft.CancelDraft();
			current_draft = null;
		}

		current_draft = current_draft;
	}

	title.set('Oro Chat Draft - Solo Draft');
</script>

<svelte:head>
	<meta name="description" content="Start a Marvel Snap Solo Draft" />
</svelte:head>

<div class="space-y-4 p-4">
	{#if current_draft}
		<div class="grid grid-cols-2">
			<h1 class="h1">Solo Draft</h1>
			<div class="grid justify-items-end">
				<button type="button" class="btn btn-lg variant-outline-warning" on:click={CancelDraft}>
					{#if current_draft.total < 12}
						Cancel Draft
					{:else}
						Finish Draft
					{/if}
				</button>
			</div>
		</div>
	{:else}
		<h1 class="h1">Solo Draft</h1>
		<div class="grid grid-cols-2">
			<SelectionCountSlider bind:selectionCount />
			<div />
		</div>
		<button type="button" class="btn btn-lg variant-filled-primary" on:click={NewDraft}>
			Start Draft
		</button><br />
	{/if}

	{#if choices && choices.length > 0}
		Draft a card by clicking on it.
		<section class="grid {grid_layout} justify-items-center">
			{#each choices as choice, index}
				<DraftChoice {choice} on:click={() => DraftCard(index)} />
			{/each}
		</section>
		{#if current_draft}
			<DraftSummary {current_draft} showCurrentPick={true} />
		{/if}
	{:else if current_draft?.cards}
		<CodeBlock language="Deck Code" class="break-words" code={current_draft.GetDeckCode()} />
		<SnapDeck cards={current_draft?.cards} />
	{/if}
	<br />
</div>
