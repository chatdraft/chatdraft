<script lang="ts">
	import { type Deck } from '$lib/snap/cards';
	import SnapDeck from './SnapDeck.svelte';

	export let currentDeck: Deck;
	export let currentPick: number | undefined = undefined;

	export let name: string = '';
	export let headerClass: string = 'h2';

	export let sort: 'order' | 'cost' = 'cost';
	$: deckSorted = sort === 'cost' ? currentDeck.toSorted((a, b) => a.cost - b.cost) : currentDeck;
</script>

<div class="grid grid-cols-2">
	<div>
		<div>
			<h2 class={headerClass}>{name} Drafted Deck</h2>
			Sorted by {sort === 'cost' ? 'ascending energy cost.' : 'draft order.'}
		</div>
	</div>

	<div>
		{#if currentPick !== undefined}
			<h2 class="h2">Pick: {currentPick}</h2>
		{/if}
	</div>
</div>
<div class="grid grid-cols-2 divide-x divide-surface-500">
	<div class="mt-4">
		<SnapDeck cards={deckSorted || []} {sort} />
	</div>
	<div class="text-left pl-4 text-xl">
		<div class="flex flex-col text-2xl">
			<div>
				{deckSorted
					.toSpliced(6, 6)
					.map((card) => card.name)
					.join(', ')}
			</div>
			<br />
			<div>
				{deckSorted
					.toSpliced(0, 6)
					.map((card) => card.name)
					.join(', ')}
			</div>
		</div>
	</div>
</div>
