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
			if (current_draft) return;

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
		<h1 class="text-black text-4xl flex justify-center uppercase font-outline-2 shadow-white font-snapa">Oro Chat Draft</h1>
		<div class="text-white text-4xl rounded-sm font-snapa">
			{#if data.hide != 'choice'}
				<!-- Pick Number and Timer -->
				<div class="bg-purple-900 bg-opacity-70 text-white text-4xl rounded-lg">
					<div class="flex items-center">
						<h2 class="font-outline pl-4">
							<span class="uppercase font-snapa font-outline shadow-black">Pick:</span>
							<span class="font-snapn font-outline shadow-black">{current_draft.total + 1}</span>
						</h2>
						<!-- Countdown Timer Icon & Seconds -->
						<div class="items-center inline-flex absolute right-4 font-snapn font-outline shadow-black">
							<iconify-icon icon="ion:timer-outline" width="32" height="32" flip="horizontal"></iconify-icon>
							<span>
								{#if time_remaining > current_draft.duration || time_remaining < 0}
									0s
								{:else}
									{time_remaining.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}s
								{/if}
							</span>
						</div>
					</div>
					<!-- Grid of Cards -->
					<div class="grid grid-cols-3 gap-2 p-2 pt-0 [text-shadow:-2px_2px_2px_var(--tw-shadow-color)] shadow-black font-outline-2 font-snapn italic">
							{#if (choices && choices.length > 0)}
									{#each choices as choice, index}
										<div class="border-white bg-black bg-opacity-70 border-2 rounded-lg shadow-md shadow-black/100 relative">
											<!-- Selection Value-->
											<span class="font-bold text-8xl flex items-center absolute top-0 left-0 bottom-0 m-auto">
												{index + 1}
											</span>
											<!-- Vote Icon & Number of Votes-->
											<div class="flex justify-center absolute bottom-0 right-2">
												<div class="flex items-center">
													<iconify-icon icon="mdi:heart" width="32" height="32" flip="horizontal" class="h-8 stroke-black stroke-1 fill-white drop-shadow-[-2px_2px_2px_var(--tw-shadow-color)] inline-block transform translate-x-1.5"></iconify-icon>
													<span class="font-outline">
														{votes[index]}
													</span>
												</div>
											</div>

											<!-- Card Image -->
											<div><SnapCard hideText={true} card={choice} /></div>

										</div>
									{/each}
							{/if}
					</div>
				</div>
			{/if}
			{#if data.hide != 'choice' && data.hide != 'deck'}
				<div class="mt-4 bg-transparent"></div>
			{/if}
			{#if data.hide != 'deck'}
				<!-- Drafted Cards -->
				<div class="bg-purple-900 bg-opacity-70 text-slate-200 text-2xl font-outline rounded-lg">
					<div class="flex justify-evenly items-center">
					<h2 class="uppercase font-snapa font-outline shadow-black">
						Drafted Cards
					</h2>
					</div>
					<!-- Grid of Cards -->
					<div class="grid grid-cols-4 gap-2 [text-shadow:2px_-2px_-2px_var(--tw-shadow-color)] shadow-black">
						{#each Array(12) as _, i}
							<div class="border-slate-200 border-0 rounded-lg relative">
								<!-- Card Image -->
								{#if current_draft?.cards[i]}
									<img src="{current_draft?.cards[i].displayImageUrl}" alt="{current_draft?.cards[i].name}" />
								{:else}
									<img src="/Placeholder.webp" alt="Placeholder card" />
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		{#if data.hide != 'deck'}
			<h1 class="text-black text-4xl flex justify-center uppercase font-outline-2 shadow-white font-snapa">Oro Chat Draft</h1>
			<div class="min-h-screen flex flex-row bg-black/70 text-white">
				<div class="flex flex-shrink flex-col">
					<SnapDeck cards={current_draft?.cards || []} cols={4} />
				</div>
			</div>
		{/if}
	{/if}
{/if}