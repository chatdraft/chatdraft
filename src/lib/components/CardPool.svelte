<script lang="ts">
	import type { ICubeDraft } from '$lib/cubeDraft';
	import type { Card } from '$lib/snap/cards';
	import ChatDraftSlideToggle from './ChatDraftSlideToggle.svelte';

	let showCardPool = false;

	export let lobby: ICubeDraft;
	export let excludedCards: Card[];
</script>

<ChatDraftSlideToggle
	label="Show Card Pool"
	name="showCardPool"
	active="bg-primary-500"
	bind:checked={showCardPool}
/>
<div class="space-y-4 mb-4" hidden={!showCardPool}>
	<div>
		<b>Card Pool:</b>
		{lobby.draftPool ? lobby.draftPool.map((card) => card.name).join(', ') : 'Full Collection'}
	</div>
	<div>
		<b>Excluded Cards:</b>
		{excludedCards && excludedCards.length > 0
			? excludedCards.map((card) => card.name).join(', ')
			: 'None'}
	</div>
</div>
