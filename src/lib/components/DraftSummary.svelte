<script lang="ts">
	import { type Deck } from '$lib/snap/cards';
	import SnapDeck from './SnapDeck.svelte';

	export let currentDeck: Deck;
	export let currentPick: number | undefined = undefined;

	export let name: string = '';
	export let headerClass: string = 'h2';
</script>

<div class="grid grid-cols-2">
	<div>
		<div>
			<h2 class={headerClass}>{name} Drafted Deck</h2>
			Sorted by ascending energy cost.
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
		<SnapDeck cards={currentDeck || []} />
	</div>
	<div class="text-left pl-4 text-xl">
		<div class="flex flex-col text-2xl">
			<div>
				{currentDeck
					.toSpliced(6, 6)
					.map((card) => card.name)
					.join(', ')}
			</div>
			<br />
			<div>
				{currentDeck
					.toSpliced(0, 6)
					.map((card) => card.name)
					.join(', ')}
			</div>
		</div>
	</div>
</div>
