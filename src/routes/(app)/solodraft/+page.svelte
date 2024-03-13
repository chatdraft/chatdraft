<script lang="ts">
    import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { Draft } from '$lib/snap/draft.js';
    import { CodeBlock, RangeSlider } from '@skeletonlabs/skeleton';
    import cards from '$lib/data/cards.json';
    
	let selectionCount = 6;
    const gridcols = ['','','','grid-cols-3','grid-cols-4','grid-cols-5','grid-cols-6']

    let current_draft: Draft | null;
    $: choices = current_draft?.currentChoice?.cards;
	$: grid_layout = gridcols[current_draft?.selections || 6];

    async function NewDraft() {
        let current_cards = cards;
        const latestCardsReq = await fetch('api/v1/cards');
        if (latestCardsReq.ok) {
            current_cards = await latestCardsReq.json();
        }
        current_draft = new Draft('', 0, selectionCount, current_cards);
        await current_draft.StartDraft();
        
        current_draft = current_draft;
    }

    async function DraftCard(index: number) {
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
</script>

<div class="space-y-4 p-4">
	<h1 class="h1">Solo Draft</h1>
	{#if (current_draft)}
		<div class="text-right">
			<button type="button" class="btn btn-lg variant-outline-warning" on:click={CancelDraft}>
				{#if current_draft.total < 12}
					Cancel draft
				{:else}
					Finish draft
				{/if}
			</button>
		</div>
	{:else}
        <div class="grid grid-cols-2">
            <RangeSlider name="selection-count" bind:value={selectionCount} min={3} max={6} ticked step={1}>
                <div class="flex justify-between items-center">
                    <div class="font-bold">Number of cards per vote</div>
                    <div class="text-xs">{selectionCount}</div>
                </div>
            </RangeSlider>
            <div/>
        </div>
        <button type="button" class="btn btn-lg variant-filled-primary" on:click={NewDraft}>Start draft</button><br/>
	{/if}
	<br/>

	{#if (choices && choices.length > 0)}
		<h3 class="h3">Options:</h3>
		Press Select to choose a card.
		<section class="grid {grid_layout} justify-items-center">
			{#each choices as choice}
				<div class="p-4"><SnapCard card={choice} /></div>
			{/each}

			{#each choices as _choice, index}
				<button
					type="button"
					class="btn btn-md variant-outline-primary p-4 w-1/2"
					on:click={() => DraftCard(index)}>Select</button>
			{/each}
		</section>
		<SnapDeck cards={current_draft?.cards || []} />
	{:else if current_draft?.cards}
		<CodeBlock language="Deck Code" class="break-words" code={current_draft.GetDeckCode()}></CodeBlock>
		<SnapDeck cards={current_draft?.cards} />
	{/if}
	<br/>
</div>
