<script lang="ts">
	import CardChoice from '$lib/components/CardChoice.svelte';
	import PreviewModeLabel from '$lib/components/PreviewModeLabel.svelte';
	import CountdownTimer from '$lib/components/CountdownTimer.svelte';
	import { invalidateAll } from '$app/navigation';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { DatetimeNowUtc } from '$lib/datetime';
	import type { Card } from '$lib/snap/cards';
	import {
		establishWebSocket,
		type WebSocketMessage,
		WebSocketMessageType
	} from '$lib/websocket.js';
	import { onMount } from 'svelte';
	import BrowserSourceFooter from '$lib/components/BrowserSourceFooter.svelte';
	import BrowserSourceHeader from '$lib/components/BrowserSourceHeader.svelte';
	import { title } from '$lib/title';

	export let data;

	let now = DatetimeNowUtc();

	let ws: WebSocket | null = null;

	let showDeck = false;
	let selectionCount = 3;

	const handleMessage = async (message: string) => {
		const wsm: WebSocketMessage = JSON.parse(message);
		now = wsm.timestamp;
		if (wsm.type == WebSocketMessageType.Connect) {
			const channelMsg: WebSocketMessage = {
				type: WebSocketMessageType.Channel,
				timestamp: DatetimeNowUtc(),
				message: data.player
			};
			ws?.send(JSON.stringify(channelMsg));
			const hideMsg: WebSocketMessage = {
				type: WebSocketMessageType.BrowserSource,
				timestamp: DatetimeNowUtc(),
				message: data.hide
			};
			ws?.send(JSON.stringify(hideMsg));
		}

		if (wsm.type == WebSocketMessageType.ShowDeck) {
			if (current_draft) return;

			const ret = await fetch(`/api/v1/draft/player/${data.player}?previous=true`);
			if (!ret.ok) return;

			data.draft = await ret.json();
			if (!data.draft) return;

			showDeck = true;
			setTimeout(() => {
				//@ts-ignore data.draft can be assigned to null, it's just known not to be null at this point
				data.draft = null;
				showDeck = false;
			}, 30000);

			return;
		}

		if (wsm.type == WebSocketMessageType.DraftComplete) {
			setTimeout(() => {
				current_draft = undefined;
			}, (current_draft ? current_draft.duration : 30) * 2 * 1000);
			invalidateAll();
		}

		if (wsm.type == WebSocketMessageType.ChoiceSelected) {
			winningCard = JSON.parse(wsm.message!);
		}

		if (wsm.type == WebSocketMessageType.NewChoice) {
			winningCard = undefined;
			invalidateAll();
		}

		if (wsm.type == WebSocketMessageType.DraftCanceled) {
			invalidateAll();
		}

		if (wsm.type == WebSocketMessageType.VoteUpdated) {
			invalidateAll();
		}

		if (wsm.type == WebSocketMessageType.PreviewToggled) {
			preview_mode = JSON.parse(wsm.message!);
			invalidateAll();
		}

		if (wsm.type == WebSocketMessageType.BattlerSelected) {
			battlerSelectedCard = JSON.parse(wsm.message!);
		}

		if (wsm.type == WebSocketMessageType.OpacityUpdated) {
			data.bgOpacity = JSON.parse(wsm.message!).bgOpacity;
		}

		showDeck = false;
		selectionCount = current_draft?.selections!;
	};

	let winningCard: Card | undefined = undefined;
	let battlerSelectedCard: Card | undefined = undefined;

	$: current_draft = data.previewStatus ? data.previewDraft : data.draft;
	$: choices = current_draft?.currentChoice?.cards!;
	$: votes = current_draft?.currentChoice?.voteCounts!;
	$: time_remaining = (current_draft?.currentChoice?.votes_closed! - now) / 1000;
	$: preview_mode = data.previewStatus;
	$: maxVotes = votes && votes.length > 0 ? Math.max(...votes) : 0;

	onMount(async () => {
		ws = await establishWebSocket(handleMessage, data.draft?.player, data.hide);

		if (data.draft) {
			selectionCount = data.draft.selections;
		}
	});
	window.onbeforeunload = function () {
		if (ws) {
			// disable onclose handler first
			ws.onclose = function () {};
			ws.close();
		}
	};

	title.set('Oro Chat Draft - Stream');
</script>

<svelte:head>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

{#if current_draft && data.displayName}
	{#if time_remaining}
		<BrowserSourceHeader />
		<div class="text-white text-4xl rounded-sm font-snapa">
			{#if data.hide != 'choice'}
				<!-- Pick Number and Timer -->
				<div
					class="bg-purple-900 text-white text-4xl rounded-t-lg bg-opacity-{data.bgOpacity}"
					class:rounded-b-lg={data.hide != 'deck'}
				>
					<div class="flex items-center">
						{#if preview_mode}
							<PreviewModeLabel />
						{/if}
						<h2 class="font-outline pl-4">
							<span class="uppercase font-snapa font-outline font-outline-black">Pick:</span>
							<span class="font-snapn font-outline font-outline-black"
								>{current_draft.total + 1}</span
							>
						</h2>
						<!-- Countdown Timer Icon & Seconds -->
						<CountdownTimer {time_remaining} defaultDuration={current_draft.duration} />
					</div>
					<!-- Grid of Cards -->
					<div
						class="grid grid-cols-3 gap-2 p-2 pt-0 [text-shadow:-2px_2px_2px_var(--tw-shadow-color)] shadow-black font-outline-black font-outline-2 font-snapn italic"
					>
						{#if choices && choices.length > 0}
							{#each choices as choice, index}
								<CardChoice
									blur={winningCard != undefined && winningCard.cardDefKey != choice.cardDefKey}
									{choice}
									{index}
									votes={votes[index]}
									currentWinner={maxVotes > 0 && votes[index] == maxVotes}
									battlerSelected={battlerSelectedCard?.cardDefKey === choice.cardDefKey}
									viewerProfilePicture={data.viewerProfilePicture}
								/>
							{/each}
						{/if}
					</div>
				</div>
			{/if}
			{#if data.hide != 'choice' && data.hide != 'deck'}
				<div class="mt-2 bg-transparent" />
			{/if}
			{#if data.hide != 'deck' && data.displayDeck}
				<!-- Drafted Cards -->
				<div
					class="bg-purple-900 text-slate-200 text-2xl font-outline rounded-t-lg bg-opacity-{data.bgOpacity}"
				>
					{#if preview_mode}
						<PreviewModeLabel />
					{/if}
					<div class="flex justify-evenly items-center">
						<h2 class="uppercase font-snapa font-outline font-outline-black">
							{data.displayName} Drafted Cards
						</h2>
					</div>
					<!-- Grid of Cards -->
					<div
						class="grid grid-cols-4 [text-shadow:2px_-2px_-2px_var(--tw-shadow-color)] shadow-black"
					>
						{#each Array(12) as _, i}
							<div class="border-slate-200 border-0 rounded-lg relative">
								<!-- Card Image -->
								{#if data.displayDeck[i]}
									<SnapCard hideName={true} hideDescription={true} card={data.displayDeck[i]} />
								{:else}
									<img src="/Placeholder.webp" alt="Placeholder card" />
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
			<BrowserSourceFooter bgOpacity={data.bgOpacity} />
		</div>
	{:else if data.hide != 'deck'}
		<BrowserSourceHeader />
		<div
			class="flex flex-row bg-black/70 text-white bg-purple-900 text-4xl rounded-t-lg bg-opacity-{data.bgOpacity}"
		>
			<div class="flex flex-shrink flex-col">
				<div class="flex justify-evenly items-center">
					<h2 class="uppercase font-snapa font-outline font-outline-black text-slate-200 text-2xl">
						{data.displayName} Drafted Cards
					</h2>
				</div>
				{#if data.hide == ''}
					<SnapDeck cards={data.displayDeck || []} cols={3} />
				{:else}
					<SnapDeck cards={data.displayDeck || []} cols={4} />
				{/if}
			</div>
		</div>
		<BrowserSourceFooter bgOpacity={data.bgOpacity} />
	{/if}
{/if}
