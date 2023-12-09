<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { twitch_login_uri } from '$lib/api/twitch/client';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { CodeBlock, RangeSlider } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Draft, GetDeckCode } from '$lib/snap/draft.js';

	export let data;
	let now = Date.now();
	let duration = 90;
	let selectionCount = 6;


	let webSocketEstablished = false;
	let ws: WebSocket | null = null;

	const establishWebSocket = async () => {
		if (webSocketEstablished) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
		heartbeat();
		ws.addEventListener('message', async (event) => {
			console.log('[websocket] message received', event);
			await handleMessage(event.data)
		});

		webSocketEstablished = true;

		return ws;
	};

	function heartbeat() {
		setTimeout(heartbeat, 500);
		if (!ws) return;
		if (ws.readyState !== 1) return;
		ws.send("ping");
	}

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

	onMount(() => {
		setInterval(() => {
			now = Date.now();
		}, 100)
		if (data.draft) {
			selectionCount = data.draft.selections;
		}
		establishWebSocket();
	});

	onDestroy(() => {
		if (ws) ws?.close()
		ws = null;
	});

	async function NewDraft() {
		const ret = await fetch(`/api/v1/draft/player?duration=${duration}&selections=${selectionCount}`, { method: 'POST' });
		invalidateAll();
		establishWebSocket();
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
	<h1>Draft</h1>
	{#if (current_draft)}
		<button type="button" class="btn btn-lg variant-outline-warning" on:click={CancelDraft}>
			{#if current_draft.total < 12}
				Cancel Draft
			{:else}
				Finish Draft
			{/if}
		</button>
	{:else}
		{#if data.botstatus}
			<div class="grid grid-cols-2">
				<RangeSlider name="duration-range" bind:value={duration} min={30} max={180} ticked step={30}>
					<div class="flex justify-between items-center">
						<div class="font-bold">Voting period</div>
						<div class="text-xs">{(Math.floor(duration/60)).toLocaleString(undefined, {maximumFractionDigits: 0})}:{(duration%60).toLocaleString(undefined, {minimumIntegerDigits: 2})}</div>
					</div>
				</RangeSlider>
				<div/>
			</div><div class="grid grid-cols-2">
				<RangeSlider name="selection-count" bind:value={selectionCount} min={3} max={6} ticked step={1}>
					<div class="flex justify-between items-center">
						<div class="font-bold">Number of cards per vote</div>
						<div class="text-xs">{selectionCount}</div>
					</div>
				</RangeSlider>
				<div/>
			</div>
			<button type="button" class="btn btn-lg variant-filled-primary" on:click={NewDraft}>New Draft</button><br/>
			Please start a new draft.
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
		Please select from:

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
		<SnapDeck cards={current_draft?.cards} />
		<CodeBlock language="Deck Code" class="break-words" code={GetDeckCode(current_draft?.cards)}></CodeBlock>
	{/if}
	<br/><br/>
	{#if previous_draft?.cards}
		<h2>Previous Draft:</h2>
		<SnapDeck cards={previous_draft.cards} />
		<CodeBlock language="Deck Code" class="break-words" code={GetDeckCode(previous_draft.cards)}></CodeBlock>
	{/if}
</div>
