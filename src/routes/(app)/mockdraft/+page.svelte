<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import  Draft from '$lib/snap/draft.js';
	import { CodeBlock, RangeSlider } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	// import { onMount } from 'svelte';

	export let data;
	let now = Date.now();
	let duration = 120;


	let webSocketEstablished = false;
	let ws: WebSocket | null = null;

	const establishWebSocket = async () => {
		if (webSocketEstablished) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}/websocket/${data.player}`);
		heartbeat();
		ws.addEventListener('message', async (event) => {
			console.log('[websocket] message received', event);
			await handleMessage(event.data)
		});

		webSocketEstablished = true;

		return ws;
	};

	function heartbeat() {
		if (!ws) return;
		if (ws.readyState !== 1) return;
		ws.send("ping");
		setTimeout(heartbeat, 500);
	}

	const handleMessage = async(message: string) => {
		if (message == 'ping') return;
		invalidateAll();
	}

	$: current_draft = data.draft;
	$: choice1 = data.choice?.card1!;
	$: choice2 = data.choice?.card2!;
	$: choice3 = data.choice?.card3!;
	$: votes1 = data.choice?.votes1!;
	$: votes2 = data.choice?.votes2!;
	$: votes3 = data.choice?.votes3!;
	$: time_remaining = (current_draft?.currentChoice?.votes_closed! - now) / 1000;

	onMount(() => {
		setInterval(() => {
			now = Date.now();
		}, 100)
		if (data.draft) establishWebSocket();
	});

	async function NewDraft() {
		const ret = await fetch(`/api/v1/draft/player?duration=${duration}`, { method: 'POST' });
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

	async function InviteBot() {
		const ret = await fetch(`/api/v1/bot/invite`, {method: 'POST'});
		invalidateAll();
	}
</script>

<svelte:head>
	<title>oro's chat draft - Mock Draft</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

<div class="space-y-4 p-4">
	<h1>Mock Draft</h1>
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
			</div>
			<button type="button" class="btn btn-lg variant-filled-primary" on:click={NewDraft}>New Draft</button><br/>
			Please start a new draft.
		{:else}
		<button type="button" class="btn btn-lg variant-filled-primary" on:click={InviteBot}>Invite Bot</button>
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

	{#if choice1 && choice2 && choice3}
		Please select from:

		<section class="grid grid-cols-3 justify-items-center">
			<div class="p-4"><SnapCard card={choice1} /></div>
			<div class="p-4"><SnapCard card={choice2} /></div>
			<div class="p-4"><SnapCard card={choice3} /></div>
			<div>{votes1} votes</div>
			<div>{votes2} votes</div>
			<div>{votes3} votes</div>
			<button
				type="button"
				class="btn btn-md variant-outline-primary p-4 w-1/2"
				on:click={() => DraftCard(1)}>Select</button
			>
			<button
				type="button"
				class="btn btn-md variant-outline-primary p-4 w-1/2"
				on:click={() => DraftCard(2)}>Select</button
			>
			<button
				type="button"
				class="btn btn-md variant-outline-primary p-4 w-1/2"
				on:click={() => DraftCard(3)}>Select</button
			>
		</section>
		<SnapDeck cards={current_draft?.cards || []} />
	{:else if current_draft?.cards}
		<SnapDeck cards={current_draft?.cards} />
		<CodeBlock language="Deck Code" class="break-words" code={Draft.GetDeckCode(current_draft?.cards)}></CodeBlock>
	{/if}
</div>
