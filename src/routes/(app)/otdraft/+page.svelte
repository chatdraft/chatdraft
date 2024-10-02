<script lang="ts">
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { CodeBlock } from '@skeletonlabs/skeleton';
	import { beforeNavigate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { title } from '$lib/title.js';
	import DraftChoice from '$lib/components/DraftChoice.svelte';
	import DraftSummary from '$lib/components/DraftSummary.svelte';

	export let data;
	$: current_draft = data.draft;
	$: choices = current_draft?.currentChoice?.cards;
	let selecting = false;
	let selected: string | undefined = undefined;

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

	$: data.draft
		? title.set(`Oro Chat Draft - One Time Draft - Pick ${data.draft.total + 1}`)
		: title.set('Oro Chat Draft - One Time Draft');
</script>

<svelte:head>
	<meta name="description" content="Start a One Time Draft" />
</svelte:head>

<div class="p-4 -mb-16">
	<div class="grid grid-cols-2">
		<h1 class="h1">One Time Draft</h1>
		{#if data.draft}
			<h2 class="h2 text-right">Pick: {data.draft?.total + 1}</h2>
		{/if}
	</div>

	{#if data.draftExpired}
		<p class="mt-4">
			This One Time Draft link was started at {data.startedAt?.toLocaleString()} and expired at {data.expiredAt?.toLocaleString()}.
			The draft was never finished and this link cannot be reused.
		</p>
	{:else if !data.draftCode}
		<p class="mt-4">No draft code supplied. Invalid link.</p>
	{:else if data.linkExpired}
		<p class="mt-4">One Time Draft link expired at {data.expiration.toLocaleString()}.</p>
	{:else if data.draftStarted}
		<p class="mt-4">One Time Draft link already started by {data.user}.</p>
	{:else if !data.validCode}
		<p class="mt-4">Invalid draft code supplied. Invalid link.</p>
	{:else}
		{#if !current_draft && !data.deckCode}
			<p class="mt-4">
				Welcome! This is a valid draft code for <b>one time use</b>. When ready, enter your name and
				click the 'Start Draft' button to launch a draft. After launch, the draft has
				<b>{data.draftExpiration} minutes</b> to be completed.
			</p>
			<form method="post" action="?/startDraft" use:enhance>
				<input type="hidden" name="code" value={data.draftCode} />
				<input
					type="hidden"
					name="username"
					placeholder="Enter your name"
					class="input w-64"
					value=" "
				/>
				<button type="submit" class="btn btn-lg variant-filled-primary mt-4">Start Draft</button><br
				/>
			</form>
		{/if}

		{#if choices && choices.length > 0}
			Draft a card by clicking on it.
			<form
				class="mt-0"
				method="post"
				action="?/draftCard"
				use:enhance={({ formData }) => {
					selecting = true;
					selected = formData.get('selection')?.toString();
					return async ({ update }) => {
						await new Promise((fulfil) => setTimeout(fulfil, 250));
						await update();
						selecting = false;
						selected = undefined;
					};
				}}
			>
				<input type="hidden" name="code" value={data.draftCode} />
				<section class="grid grid-cols-6 justify-items-center gap-4">
					{#each choices as choice}
						<DraftChoice
							{choice}
							{selecting}
							{selected}
							disabled={selecting}
							value={choice.cardDefKey}
						/>
					{/each}
				</section>
			</form>
			{#if current_draft}
				<DraftSummary currentDeck={current_draft.cards} currentPick={current_draft.total + 1} />
			{/if}
		{:else if data.deckCode}
			<CodeBlock language="Deck Code" class="break-words mt-4" code={data.deckCode} />
			<SnapDeck cards={data.cards} />
			<p>
				Started: {data.startedAt?.toLocaleString()} – Finished: {data.finishedAt?.toLocaleString()}
			</p>
		{/if}
	{/if}
</div>
