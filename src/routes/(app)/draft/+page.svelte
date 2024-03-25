<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { twitch_login_uri } from '$lib/api/twitch/client';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { CodeBlock, SlideToggle } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { establishWebSocket } from '$lib/websocket.js';
	import type { PageData } from './$types';
	import DurationSlider from '$lib/components/DurationSlider.svelte';
	import SelectionCountSlider from '$lib/components/SelectionCountSlider.svelte';

	export let data: PageData;
	let now = Date.now();
	let duration = data.duration || 90;
	let selectionCount = data.selectionCount || 6;
	let subsExtraVote = data.subsExtraVote;

	let ws: WebSocket | null = null;

	const handleMessage = async(message: string) => {
		if (message == 'pong') return;
		invalidateAll();
	}

	const gridcols = ['','','','grid-cols-3','grid-cols-4','grid-cols-5','grid-cols-6']

	$: current_draft = data.draft;
	$: previous_draft = data.previous_draft;
	$: choices = data.choice?.cards!;
	$: votes = data.choice?.voteCounts!;
	$: time_remaining = (current_draft?.currentChoice?.votes_closed! - now) / 1000;
	$: grid_layout = gridcols[current_draft?.selections || 6];
	$: current_deck_code = data.draft_deck_code;
	$: previous_deck_code = data.prev_draft_deck_code;

	onMount(async () => {
		setInterval(() => {
			now = Date.now();
		}, 100)
		if (data.draft) {
			selectionCount = data.draft.selections;
		}
		ws = await establishWebSocket(handleMessage);
	});

	onDestroy(() => {
		if (ws) ws?.close()
		ws = null;
	});

	async function NewDraft() {
		const ret = await fetch(`/api/v1/draft/player?duration=${duration}&selections=${selectionCount}&subsExtraVote=${subsExtraVote}`, { method: 'POST' });
		invalidateAll();
	}

	async function DraftCard(cardNumber: number) {
		const ret = await fetch(`/api/v1/draft/player/choice/${cardNumber}`, { method: 'POST' });
		invalidateAll();
	}

	async function CancelDraft() {
		const ret = await fetch('/api/v1/draft/player', { method: 'DELETE' });
		invalidateAll();
	}
</script>

<svelte:head>
	<title>oro's chat draft - Draft</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

<div class="space-y-4 p-4">
	<h1 class="h1">Draft</h1>
	<br/>
	{#if (current_draft)}
		<div class="absolute right-10 top-20">
			<button type="button" class="btn btn-lg variant-outline-warning" on:click={CancelDraft}>
				{#if current_draft.total < 12}
					Cancel Draft
				{:else}
					Finish Draft
				{/if}
			</button>
		</div>
	{:else}
		{#if data.user?.initialSetupDone}
			{#if data.botstatus }
				<div class="grid grid-cols-2">
					<DurationSlider bind:duration />
					<div/>
				</div>
				<div class="grid grid-cols-2">
					<SelectionCountSlider bind:selectionCount />
					<div/>
				</div>
				<div class="align-super">
					<span class="font-bold inline-block align-top mt-1">Subscriber votes +1:</span>
					<SlideToggle name="subsExtraVote" checked={data.subsExtraVote} active="bg-primary-500" label="Subscriber votes +1" />
				</div>
				<button type="button" class="btn btn-lg variant-filled-primary" on:click={NewDraft}>Start Draft</button><br/>
			{:else}
				The bot isn't set up to join your Twitch channel. This is required
				to do a Twitch Chat Draft. Please go to <a href="/settings" class="anchor">Settings</a> to invite the bot
				or you can run a <a href="/solodraft" class="anchor">Solo Draft</a>.
			{/if}
		{:else}
			If this is your first time here, please go to
			<a class="anchor" href="/start">Getting Started</a>. 
			{#if !($page.data.user)}
				Otherwise, please
				<a class="anchor" href="{twitch_login_uri}">Login with Twitch</a>
			{/if}
		{/if}
	{/if}
	<br/>
	{#if current_draft?.currentChoice?.votes_closed}
		<section class="text-center text-2xl">
			{#if time_remaining > 0}
					Time Remaining: {time_remaining.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
				{:else}
					Tallying Final Votes...
				{/if}
		</section>
	{/if}

	{#if current_draft && current_draft.deckName }
		<section class="text-center text-2xl">{current_draft.deckName}</section>
	{/if}

	{#if (choices && choices.length > 0)}
		<h3 class="h3">Options:</h3>
		Press Select to override the votes and force choose a particular card.
		<section class="grid {grid_layout} justify-items-center">
			{#each choices as choice}
				<div class="p-4"><SnapCard card={choice} /></div>
			{/each}
			{#each votes as vote}
				<div>{vote} votes</div>
			{/each}
			{#each choices as _choice, index}
				<button
					type="button"
					class="btn btn-md variant-outline-primary p-4 w-1/2"
					on:click={() => DraftCard(index)}>Select</button
				>
			{/each}
		</section>
		<SnapDeck cards={current_draft?.cards || []} />
	{:else if current_draft?.cards}
		<CodeBlock language="Deck Code" class="break-words" code={current_deck_code}></CodeBlock>
		<SnapDeck cards={current_draft?.cards} />
	{/if}
	<br/>
	{#if previous_draft?.cards}
		<h2 class="h2">Previous Draft:</h2>
		<CodeBlock language="Deck Code" class="break-words" code={previous_deck_code}></CodeBlock>
		<SnapDeck cards={previous_draft.cards} />
	{/if}
</div>
