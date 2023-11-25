<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { onMount } from 'svelte';

	export let data;

	let now = Date.now();

	let webSocketEstablished = false;
	let ws: WebSocket | null = null;

	let showDeck = false;
	let selectionCount = 3;

	const establishWebSocket = async () => {
		if (webSocketEstablished) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}/websocket/${data.player}`);
		heartbeat();
		ws.addEventListener('message', async (event) => {
			if (event.data == 'pong') return;
			console.log('[websocket] message received', event);
			await handleMessage(event.data)
		});

		return ws;
	};

	function heartbeat() {
		setTimeout(heartbeat, 500);
		if (!ws) return;
		if (ws.readyState !== 1) return;
		ws.send("ping");
	}

	const handleMessage = async(message: string) => {
		if (message == 'showdeck') {
			if (data.draft) return;

			const ret = await fetch(`/api/v1/draft/player/${data.player}?previous=true`)
			if (!ret.ok) return;

			data.draft = await ret.json();
			if (!data.draft) return;

			showDeck = true;
			setTimeout(() => {
				if (showDeck) {
					data.draft = null;
					showDeck = false;
				}
			}, 30000)


			return;
		}

		if (message.startsWith('draftcomplete')) {
			setTimeout(() => {
				current_draft = null;
			}, (current_draft ? current_draft.duration : 30) * 2 * 1000)
		}

		invalidateAll();
		showDeck = false;
		selectionCount = current_draft?.selections!;
	}

	const gridcols = ['','','grid-cols-2','grid-cols-3','grid-cols-4','grid-cols-5','grid-cols-6']

	$: current_draft = data.draft;
	$: choices = data.choice?.cards!;
	$: votes = data.choice?.voteCounts!;
	$: time_remaining = (current_draft?.currentChoice?.votes_closed! - now) / 1000;
	$: grid_layout = gridcols[current_draft?.selections || 3];

	onMount(async () => {
		setInterval(() => {
			now = Date.now();
		}, 100)
		await establishWebSocket();
		if (data.draft) {
			selectionCount = data.draft.selections;
		}
	});
</script>

<svelte:head>
	<title>oro's chat draft - Stream</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

{#if current_draft}
	{#if time_remaining }
		<div class="min-h-screen flex flex-col bg-black/70 text-white">
			<section class="text-center text-5xl my-4">
				{#if time_remaining > current_draft.duration || time_remaining < 0}
					Tallying Final Votes...
				{:else}
					Time Remaining: {time_remaining.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
				{/if}
			</section>
			<div class="grid {grid_layout} justify-items-center">
				{#if (choices && choices.length > 0)}
					{#each votes as vote}
						<div class="text-center text-3xl max-h-fit my-4">{vote} votes</div>
					{/each}
					{#each choices as choice}
						<div><SnapCard hideText={true} card={choice} /></div>
					{/each}
					{#each choices as _choice, index}
						<div class="text-center text-6xl my-4">{index + 1}</div>
					{/each}
				{/if}
			</div>
			<div class="flex flex-shrink">
				<div class="shrink basis-1/2"></div>
				<SnapDeck cards={current_draft?.cards || []} />
				<div class="shrink basis-1/2"></div>
			</div>
		</div>
	{:else}
		<div class="min-h-screen flex flex-row bg-black/70 text-white">
			<div class="flex flex-shrink flex-col">
				<div class="h1 text-center my-10">Draft Complete! - {current_draft.deckName}</div>
				<SnapDeck cards={current_draft?.cards || []} cols={4} />
			</div>
		</div>
	{/if}
{/if}