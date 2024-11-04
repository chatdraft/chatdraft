<script lang="ts">
	import { type Deck } from '$lib/snap/cards';
	import SnapDeck from './SnapDeck.svelte';

	export let currentDeck: Deck;
	export let currentPick: number | undefined = undefined;

	export let name: string = '';
	export let headerClass: string = 'h2';

	export let sort: 'order' | 'cost' = 'cost';
	$: deckSorted = sort === 'cost' ? currentDeck.toSorted((a, b) => a.cost - b.cost) : currentDeck;

	export let playerSelected: boolean | undefined = undefined;
	export let soloDraft: boolean = true;
</script>

<div class="grid grid-cols-2">
	<div>
		<div>
			<h2 class={headerClass}>
				{#if playerSelected !== undefined}
					<iconify-icon icon="mdi:lock" width="24" height="24" class:invisible={!playerSelected} />
				{/if}
				{name ? name : 'Drafted Deck'}
			</h2>
			{#if soloDraft}
				Sorted by {sort === 'cost' ? 'ascending energy cost.' : 'draft order.'}
			{/if}
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
