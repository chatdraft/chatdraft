<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { twitch_login_uri } from '$lib/api/twitch/client';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { Accordion, AccordionItem, CodeBlock } from '@skeletonlabs/skeleton';
	import { getContext, onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		establishWebSocket,
		WebSocketMessageType,
		type WebSocketMessage
	} from '$lib/websocket.js';
	import type { PageData } from './$types';
	import DurationSlider from '$lib/components/DurationSlider.svelte';
	import SelectionCountSlider from '$lib/components/SelectionCountSlider.svelte';
	import ChatDraftSlideToggle from '$lib/components/ChatDraftSlideToggle.svelte';
	import { enhance } from '$app/forms';
	import { DatetimeNowUtc } from '$lib/datetime';
	import { title } from '$lib/title';
	import FeaturedCardOptions from '$lib/components/FeaturedCardOptions.svelte';
	import { type FeaturedCardMode } from '$lib/featuredCard';
	import { seconds_to_ms } from '$lib/constants';
	import { GetLoginUri } from '$lib/login';

	export let data: PageData;
	let now = DatetimeNowUtc();
	let duration = data.duration || 90;
	let selectionCount = data.selectionCount || 6;
	let subsExtraVote = data.subsExtraVote;

	let ws: WebSocket | null = null;

	let featuredCardSelect: 'seasonpass' | 'spotlight' | 'custom' | undefined;
	let featuredCardMode: FeaturedCardMode = 'off';
	let customFeaturedCardDefKey: string = '';

	let customFeaturedCardValidationMessage = '';

	const handleMessage = async (message: string) => {
		const wsm: WebSocketMessage = JSON.parse(message);
		now = wsm.timestamp;

		if (wsm.type == WebSocketMessageType.Pong) return;

		if (wsm.type == WebSocketMessageType.DraftComplete) {
			setTimeout(() => {
				invalidateAll();
			}, (current_draft ? current_draft.duration : 30) * 2 * seconds_to_ms);
		}
		invalidateAll();
	};

	const gridcols = ['', '', '', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6'];

	$: current_draft = data.draft;
	$: previous_draft = data.previous_draft;
	$: choices = data.choice?.cards!;
	$: votes = data.choice?.voteCounts!;
	$: time_remaining = (current_draft?.currentChoice?.votes_closed! - now) / seconds_to_ms;
	$: grid_layout = gridcols[current_draft?.selections || 6];
	$: current_deck_code = data.draft_deck_code;
	$: previous_deck_code = data.prev_draft_deck_code;

	onMount(async () => {
		if (data.draft) {
			selectionCount = data.draft.selections;
		}
		ws = await establishWebSocket(handleMessage);
	});

	onDestroy(() => {
		if (ws) ws?.close();
		ws = null;
	});

	const { ResetTimeout } = getContext<{ ResetTimeout: () => void }>('ResetTimer');

	title.set('Oro Chat Draft - Draft');
</script>

<svelte:head>
	<meta name="description" content="Start a Marvel Snap Oro Chat Draft on Twitch" />
</svelte:head>

<div class="space-y-4 p-4">
	{#if current_draft}
		<div class="grid grid-cols-2">
			<h1 class="h1">Draft</h1>
			<div class="grid justify-items-end">
				<form method="post" action="?/cancelDraft" use:enhance>
					<button class="btn btn-lg variant-outline-warning">
						{#if current_draft.total < 12}
							Cancel Draft
						{:else}
							Finish Draft
						{/if}
					</button>
				</form>
			</div>
		</div>
	{:else}
		<h1 class="h1">Draft</h1>
		<p class="mt-4">
			Set the time duration for each voting period, the number of card choices, and subscriber
			bonuses. ‘Start Draft’ button launches the Oro Chat Draft application.
		</p>
		{#if data.user?.initialSetupDone}
			{#if data.botstatus}
				<form
					method="post"
					action="?/newDraft"
					use:enhance={({ cancel }) => {
						if (featuredCardMode != 'off' && featuredCardSelect == 'custom') {
							if (customFeaturedCardDefKey == '') {
								customFeaturedCardValidationMessage = 'Please enter a custom featured card.';
								cancel();
							} else if (
								!data.cardPool?.all.some((card) => card.cardDefKey == customFeaturedCardDefKey)
							) {
								customFeaturedCardValidationMessage = 'Please select a valid custom featured card.';
								cancel();
							}
						}
						return async () => {
							featuredCardMode = 'off';
							featuredCardSelect = undefined;
							customFeaturedCardDefKey = '';
							customFeaturedCardValidationMessage = '';
						};
					}}
				>
					<div class="grid grid-cols-2">
						<DurationSlider bind:duration />
						<div />
					</div>
					<div class="grid grid-cols-2">
						<SelectionCountSlider bind:selectionCount />
						<div />
					</div>
					<Accordion regionControl="flex-row-reverse gap-4 text-primary-500" width="w-1/2">
						<AccordionItem>
							<svelte:fragment slot="summary">Advanced</svelte:fragment>
							<svelte:fragment slot="content">
								<ChatDraftSlideToggle
									name="subsExtraVote"
									checked={data.subsExtraVote || false}
									active="bg-primary-500"
									label="Subscriber Votes +1"
								/>
								<b>Battle Viewer:</b>
								<input class="input w-64" type="text" name="battleChatter" placeholder="None" />
								<br />
								<FeaturedCardOptions
									cardPool={data.cardPool}
									bind:featuredCardSelect
									bind:featuredCardMode
									bind:customFeaturedCardDefKey
									bind:customFeaturedCardValidationMessage
									collection={data.playerCollection}
								/>
							</svelte:fragment>
						</AccordionItem>
					</Accordion>
					<br />
					<button class="btn btn-lg variant-filled-primary mt-2" on:click={ResetTimeout}>
						Start Draft
					</button><br />
				</form>
			{:else}
				<div class="mt-4">
					The bot isn't set up to join your Twitch channel. This is required to do a Twitch Chat
					Draft. Please go to <a href="/settings" class="anchor">Settings</a> to invite the bot.
				</div>
			{/if}
		{:else if $page.data.user}
			<div class="mt-4">
				If this is your first time here, please go to
				<a class="anchor" href="/start">Getting Started</a>.
			</div>
		{:else}
			<div class="mt-4">
				Please <a
					class="anchor"
					href={GetLoginUri($page.url.searchParams.get('redirect'), $page.url.pathname)}
				>
					Login with Twitch
				</a>
			</div>
		{/if}
	{/if}
	{#if current_draft?.currentChoice?.votes_closed}
		<p>‘Select’ buttons override chat votes. ‘Cancel Draft’ button aborts the current draft.</p>
		<section class="text-center text-2xl mt-0">
			{#if time_remaining > 0}
				Time Remaining: {time_remaining.toLocaleString(undefined, {
					minimumFractionDigits: 0,
					maximumFractionDigits: 0
				})}
			{:else}
				Tallying Final Votes...
			{/if}
		</section>
	{/if}

	{#if current_draft && current_draft.deckName}
		<section class="text-center text-2xl">{current_draft.deckName}</section>
	{/if}

	{#if choices && choices.length > 0}
		<section class="grid {grid_layout} justify-items-center">
			{#each choices as choice}
				<div class="p-4 card m-4"><SnapCard card={choice} /></div>
			{/each}
			{#each votes as vote}
				<div>{vote} votes</div>
			{/each}
			{#each choices as choice}
				<form method="post" action="?/draftCard" use:enhance>
					<div>
						<input type="hidden" value={choice.cardDefKey} name="selection" />
						<button class="btn btn-md variant-outline-primary">Select</button>
					</div>
				</form>
			{/each}
		</section>
		<SnapDeck cards={current_draft?.cards || []} />
	{:else if current_draft?.cards}
		<p class="mt-4">
			Deck code can be copied and pasted directly into Marvel Snap deck builder. ‘Finish Draft’
			button completes the draft and allows a new draft to be started.
		</p>
		<CodeBlock language="Deck Code" class="break-words" code={current_deck_code} />
		<SnapDeck cards={current_draft?.cards} />
	{/if}
	{#if previous_draft?.cards}
		<h2 class="h2">Previous Draft:</h2>
		<p class="mt-4">
			Last completed draft deck code can be copied and pasted directly into Marvel Snap deck
			builder.
		</p>
		<CodeBlock language="Deck Code" class="break-words" code={previous_deck_code} />
		<SnapDeck cards={previous_draft.cards} />
	{/if}
</div>
