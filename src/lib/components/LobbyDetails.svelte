<script lang="ts">
	import type { ICubeDraft } from '$lib/cubeDraft';

	export let lobby: ICubeDraft;
</script>

<div class="space-y-2">
	<p><b>Round Duration:</b> {lobby.duration}</p>
	<p><b>Selections per Round:</b> {lobby.selections}</p>
	<p><b>Featured Card Mode:</b> {lobby.featuredCardMode}</p>
	{#if lobby.featuredCardMode && lobby.featuredCardMode != 'off'}
		<p><b>Featured Card:</b> {lobby.featuredCardDefKey}</p>
	{/if}
	<p><b>Face Down Draft:</b> {lobby.faceDownDraft ? 'Yes' : 'No'}</p>
	<p>
		<b>Removed Cards:</b>
		{#if lobby?.removedCards.length > 0}
			{lobby.removedCards.join(', ')}
		{:else}
			None
		{/if}
	</p>
	<p><b>Quick Picks:</b> {lobby?.quickPick ? 'Yes' : 'No'}</p>
</div>
