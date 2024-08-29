<script lang="ts">
	import type IDraft from '$lib/snap/draft';
	import SnapDeck from './SnapDeck.svelte';

	export let current_draft: IDraft;
</script>

<h2 class="h2 mt-4">Drafted Deck</h2>
Sorted by ascending energy cost.
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
