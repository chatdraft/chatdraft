<script lang="ts">
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { CodeBlock, popup } from '@skeletonlabs/skeleton';
	import { beforeNavigate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { title } from '$lib/title.js';

	export let data;
	$: current_draft = data.draft;
	$: choices = current_draft?.currentChoice?.cards;

	beforeNavigate((navigation) => {
		if (
			current_draft &&
			current_draft.total < 12 &&
			!confirm(
				'You are about to leave this page. You might not be able to return to finish the draft. Continue?'
			)
		) {
			navigation.cancel();
		}
	});

	title.set('Oro Chat Draft - One Time Draft');
</script>

<svelte:head>
	<meta name="description" content="Start a One Time Draft" />
</svelte:head>

<div class="space-y-4 p-4">
	<h1 class="h1">One Time Draft</h1>

	{#if data.draftExpired}
		<p class="mt-4">This draft was started and has expired.</p>
	{:else if !data.draftCode}
		<p class="mt-4">No draft code supplied. Invalid link.</p>
	{:else if data.linkExpired}
		<p class="mt-4">One Time Draft link expired on {data.expiration.toLocaleDateString()}.</p>
	{:else if !data.validCode}
		<p class="mt-4">Invalid draft code supplied. Invalid link.</p>
	{:else}
		{#if !current_draft && !data.deckCode}
			<p class="mt-4">
				This draft link can only be used one time. Please click Start Draft when you are ready. The
				draft will expire after X hours.
			</p>
			<br />
			<form method="post" action="?/startDraft" use:enhance>
				<input type="hidden" name="code" value={data.draftCode} />
				<button type="submit" class="btn btn-lg variant-filled-primary">Start Draft</button><br />
			</form>
		{/if}

		{#if choices && choices.length > 0}
			<h3 class="h3">Options:</h3>
			Click on a card to select that card.
			<form method="post" action="?/draftCard" use:enhance>
				<input type="hidden" name="code" value={data.draftCode} />
				<section class="grid grid-cols-6 justify-items-center">
					{#each choices as choice}
						<div class="p-4">
							<button
								type="submit"
								name="selection"
								value={choice.cardDefKey}
								use:popup={{
									event: 'hover',
									target: `popupHover${choice.cardDefKey}`,
									placement: 'top'
								}}
								class="[&>*]:pointer-events-none"
								><SnapCard card={choice} hideText={true} />
							</button>
							<div
								class="card p-4 variant-filled-secondary"
								data-popup={`popupHover${choice.cardDefKey}`}
							>
								<b>{choice.name}</b>
								<div class="arrow variant-filled-secondary" />
							</div>
						</div>
					{/each}
				</section>
			</form>
			<div class="w-3/4">
				<SnapDeck cards={current_draft?.cards || []} />
			</div>
		{:else if data.deckCode}
			<CodeBlock language="Deck Code" class="break-words" code={data.deckCode} />
			<SnapDeck cards={data.cards} />
			Started At: {data.startedAt.toLocaleDateString()}
			{data.startedAt.toLocaleTimeString()}<br />
			Finished At: {data.finishedAt.toLocaleDateString()}
			{data.finishedAt.toLocaleTimeString()}
		{/if}
		<br />
	{/if}
</div>
