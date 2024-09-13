<script lang="ts">
	import type IDraft from '$lib/snap/draft';
	import SnapDeck from './SnapDeck.svelte';

	export let current_draft: IDraft;
	export let showCurrentPick: boolean = false;
</script>

<div class="grid grid-cols-2">
	<div class="grid grid-cols-2">
		<div>
			<h2 class="h2">Drafted Deck</h2>
			Sorted by ascending energy cost.
		</div>
	</div>

	<div>
		{#if showCurrentPick}
			<h2 class="h2">Pick: {current_draft.total + 1}</h2>
		{/if}
	</div>
</div>
<div class="grid grid-cols-2 divide-x divide-surface-500">
	<div class="mt-4">
		<SnapDeck cards={current_draft?.cards || []} />
	</div>
	<div class="text-left pl-4 text-xl">
		<div class="flex flex-col text-2xl">
			<div>
				{current_draft?.cards
					.toSpliced(6, 6)
					.map((card) => card.name)
					.join(', ')}
			</div>
			<br />
			<div>
				{current_draft?.cards
					.toSpliced(0, 6)
					.map((card) => card.name)
					.join(', ')}
			</div>
		</div>
	</div>
</div>
