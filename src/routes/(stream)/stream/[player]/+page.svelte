<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import type { Card } from '$lib/snap/draft.js';
	import { establishWebSocket } from '$lib/websocket.js';
	import { onMount } from 'svelte';

	export let data;

	let now = Date.now();

	let ws: WebSocket | null = null;

	let showDeck = false;
	let selectionCount = 3;

	const handleMessage = async(message: string) => {
		if (message.startsWith("Hello")) {
			ws?.send(`channel:${data.player}`)
			ws?.send(`bs:${data.hide}`);
		}
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
			invalidateAll();
		}

		if (message.startsWith('choiceselected')) {
			winningCard = JSON.parse(message.slice('choiceselected:'.length));
		}

		if (message.startsWith('newchoice')) {
			winningCard = undefined;
			invalidateAll();
		}
		
		if (message.startsWith('draftcanceled')) {
			invalidateAll();
		}

		if (message.startsWith('voteupdated')) {
			invalidateAll();
		}

		if (message.startsWith('previewtoggled')) {
			invalidateAll();
		}

		showDeck = false;
		selectionCount = current_draft?.selections!;
	}

	let winningCard: Card | undefined = undefined;

	$: current_draft = data.previewStatus ? data.previewDraft : data.draft;
	$: choices = current_draft?.currentChoice?.cards!;
	$: votes = current_draft?.currentChoice?.voteCounts!;
	$: time_remaining = (current_draft?.currentChoice?.votes_closed! - now) / 1000;

	onMount(async () => {
		setInterval(() => {
			now = Date.now();
		}, 100)
		ws = await establishWebSocket(handleMessage, data.draft?.player, data.hide);
		
		if (data.draft) {
			selectionCount = data.draft.selections;
		}
	});
	window.onbeforeunload = function() {
		if (ws) {
			ws.onclose = function () {}; // disable onclose handler first
			ws.close();
		}
	};
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
				<div class="bg-purple-900 bg-opacity-70 text-white text-4xl rounded-t-lg" class:rounded-b-lg={data.hide != 'deck'}>
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
									{current_draft.duration}s
								{:else}
									{time_remaining.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}s
								{/if}
							</span>
						</div>
					</div>
					<!-- Grid of Cards -->
					<div class="grid grid-cols-3 p-2 pt-0 [text-shadow:-2px_2px_2px_var(--tw-shadow-color)] shadow-black font-outline-2 font-snapn italic">
						{#if (choices && choices.length > 0)}
								{#each choices as choice, index}
									<div class="border-white bg-black bg-opacity-70 border-2 rounded-lg shadow-md shadow-black/100 relative" class:blur="{winningCard && winningCard.cardDefKey != choice.cardDefKey}">
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
				<div class="mt-2 bg-transparent"></div>
			{/if}
			{#if data.hide != 'deck'}
				<!-- Drafted Cards -->
				<div class="bg-purple-900 bg-opacity-70 text-slate-200 text-2xl font-outline rounded-t-lg">
					<div class="flex justify-evenly items-center">
					<h2 class="uppercase font-snapa font-outline shadow-black">
						Drafted Cards
					</h2>
					</div>
					<!-- Grid of Cards -->
					<div class="grid grid-cols-4 [text-shadow:2px_-2px_-2px_var(--tw-shadow-color)] shadow-black">
						{#each Array(12) as _, i}
							<div class="border-slate-200 border-0 rounded-lg relative">
								<!-- Card Image -->
								{#if current_draft?.cards[i]}
									<SnapCard hideText={true} card={current_draft?.cards[i]} />
								{:else}
									<img src='/Placeholder.webp' alt="Placeholder card" />
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		<p class="bg-purple-900 bg-opacity-70 rounded-b-lg text-xl flex justify-center font-outline uppercase shadow-black font-snapa">To use Chat Draft, inquire at:&nbsp;<span class="anchor font-serif font-outline-0 normal-case relative bottom-[2px]">twitch.tv/jjrolk</span></p>
		</div>
	{:else}
		{#if data.hide != 'deck'}
			<h1 class="text-black text-4xl flex justify-center uppercase font-outline-2 shadow-white font-snapa">Oro Chat Draft</h1>
			<div class="flex flex-row bg-black/70 text-white bg-purple-900 bg-opacity-70 text-4xl rounded-t-lg">
				<div class="flex flex-shrink flex-col">
					{#if data.hide == ''}
						<SnapDeck cards={current_draft?.cards || []} cols={3} />
					{:else}
						<SnapDeck cards={current_draft?.cards || []} cols={4} />
					{/if}
				</div>
			</div>
			<p class="bg-purple-900 bg-opacity-70 rounded-b-lg text-xl flex justify-center font-outline uppercase shadow-black text-white font-snapa">To use Chat Draft, inquire at:&nbsp;<span class="anchor font-serif font-outline-0 normal-case relative bottom-[2px]">twitch.tv/jjrolk</span></p>
		{/if}
	{/if}
{/if}