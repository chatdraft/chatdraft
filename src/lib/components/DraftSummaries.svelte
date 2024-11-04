<script lang="ts">
	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

	import DraftSummary from './DraftSummary.svelte';
	import type { Deck } from '$lib/snap/cards';
	import type { Player } from '$lib/snap/player';

	export let draftedDecks: Map<string, Deck>;
	export let players: Player[];

	let sort: 'cost' | 'order' = 'cost';
</script>

<hr />
<div class="grid grid-cols-2 mt-2">
	<h2 class="h2">Drafted Decks</h2>
	<div class="flex place-self-end space-x-2">
		<div class="inline-flex content-center">
			<span class="align-middle inline-flex items-center content-center font-bold">Sort by:</span>
		</div>
		<RadioGroup
			name="opponentDraftSort"
			active="variant-filled-primary"
			hover="hover:variant-soft-primary"
		>
			<RadioItem bind:group={sort} name="opponentDraftSort" value="cost">Cost</RadioItem>
			<RadioItem bind:group={sort} name="opponentDraftSort" value="order">Order</RadioItem>
		</RadioGroup>
	</div>
	Sorted by {sort === 'cost' ? 'ascending energy cost.' : 'draft order.'}
</div>
{#each draftedDecks.entries() as [key, value]}
	{@const playerSelected = players.find((player) => player.name == key)?.cardSelected || false}
	<DraftSummary
		name={key}
		currentDeck={value}
		headerClass="h3"
		{sort}
		{playerSelected}
		soloDraft={false}
	/>
{/each}
