<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import ChatDraftSlideToggle from '$lib/components/ChatDraftSlideToggle.svelte';
	import DraftChoice from '$lib/components/DraftChoice.svelte';
	import DraftSummary from '$lib/components/DraftSummary.svelte';
	import { title } from '$lib/title';
	import { establishWebSocket, WebSocketMessageType, type WebSocketMessage } from '$lib/websocket';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { DatetimeNowUtc } from '$lib/datetime';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { clipboard, CodeBlock } from '@skeletonlabs/skeleton';
	import { CalculateExcludedCards, GetDeckCode } from '$lib/snap/cards';
	import { page } from '$app/stores';
	import { seconds_to_ms } from '$lib/constants';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import CardsSelector from '$lib/components/CardsSelector.svelte';
	import { compareArrays } from '$lib/snap/utils';
	import DurationSlider from '$lib/components/DurationSlider.svelte';
	import SelectionCountSlider from '$lib/components/SelectionCountSlider.svelte';
	import type { FeaturedCardMode } from '$lib/featuredCard';
	import FeaturedCardOptions from '$lib/components/FeaturedCardOptions.svelte';
	import LobbyPlayerTable from '$lib/components/LobbyPlayerTable.svelte';
	import { PlayerStatus } from '$lib/snap/player';
	import OpponentDraftSummaries from '$lib/components/OpponentDraftSummaries.svelte';

	export let data: PageData;
	let now = DatetimeNowUtc();

	let ws: WebSocket | null = null;

	let showCardPool = false;

	let selecting = false;
	let selected: string | undefined = data.selectedCard?.cardDefKey;

	let editing: boolean = false;

	let featuredCardSelect: 'seasonpass' | 'spotlight' | 'custom' | undefined =
		data.lobby.featuredCardDefKey == data.cardDb.currentSeasonPassCardDefId
			? 'seasonpass'
			: data.lobby.featuredCardDefKey == data.cardDb.currentSpotlightCardDefId
			? 'spotlight'
			: data.lobby.featuredCardDefKey != ''
			? 'custom'
			: undefined;
	let featuredCardMode: FeaturedCardMode = data.lobby.featuredCardMode;
	let customFeaturedCardDefKey: string = data.lobby.featuredCardDefKey;

	let customFeaturedCardValidationMessage = '';

	const toastStore = getToastStore();

	const handleMessage = async (message: string) => {
		const wsm: WebSocketMessage = JSON.parse(message);
		now = wsm.timestamp;
		if (wsm.type == WebSocketMessageType.Connect) {
			const channelMsg: WebSocketMessage = {
				type: WebSocketMessageType.LobbyName,
				timestamp: DatetimeNowUtc(),
				message: data.lobby.lobbyName
			};
			ws?.send(JSON.stringify(channelMsg));
		}

		if (wsm.type == WebSocketMessageType.LobbyDraftPoolUpdated) {
			toastStore.trigger({ message: `Draft pool has been updated.`, timeout: 30 * seconds_to_ms });
		}

		if (wsm.type == WebSocketMessageType.Pong) return;

		if (wsm.type == WebSocketMessageType.LobbyClosed) {
			if (!data.canEditLobby)
				toastStore.trigger({
					message: `The lobby ${data.lobby.lobbyName} was closed.`
				});
			await goto('/cubedraft');
			return;
		}

		if (wsm.type == WebSocketMessageType.LobbyLockInUpdated) {
			data.lobby.lockInRoundEndsAt = wsm.message ? JSON.parse(wsm.message) : undefined;
		}

		console.log(wsm);
		await invalidateAll();
		excludedCards = ExcludedCards();
	};

	$: time_remaining = (data.lobby?.roundEndsAt! - now) / seconds_to_ms;
	$: lockInTimeRemaining = data.lobby?.lockInRoundEndsAt
		? (data.lobby?.lockInRoundEndsAt - now) / seconds_to_ms
		: undefined;

	let cardsToRemove: string[] = data.lobby.removedCards;

	let excludedCards = ExcludedCards();

	function ExcludedCards() {
		return CalculateExcludedCards(
			data.cardDb,
			data.lobby.draftPool.map((card) => card.cardDefKey),
			data.lobby.removedCards
		);
	}

	onMount(async () => {
		ws = await establishWebSocket(handleMessage);
	});

	onDestroy(() => {
		if (ws) ws?.close();
		ws = null;
	});

	title.set(`Oro Chat Draft - Cube Draft - ${data.lobby?.lobbyName}`);
</script>

<svelte:head>
	<meta name="description" content="Marvel Snap Cube Draft" />
</svelte:head>

<div class="p-4">
	<div class="grid grid-cols-3">
		<h1 class="h1">Cube Draft</h1>
		<section class="text-center text-2xl mt-0">
			{#if data.lobby?.roundEndsAt && data.draft && data.draft?.total < 12}
				Time Remaining: {time_remaining > 0
					? time_remaining.toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0
					  })
					: '0'}
				{#if lockInTimeRemaining}
					&nbsp; / <iconify-icon
						icon="mdi:lock"
						width="32"
						height="32"
						class="align-text-bottom"
					/>: {lockInTimeRemaining > 0
						? lockInTimeRemaining.toLocaleString(undefined, {
								minimumFractionDigits: 0,
								maximumFractionDigits: 0
						  })
						: '0'}
				{/if}
			{/if}
		</section>

		<div class="flex flex-row place-content-end space-x-2">
			{#if data.canEditLobby}
				<form method="post" action="?/closeLobby" use:enhance>
					<button class="btn btn-lg variant-outline-error"> Close Lobby </button>
				</form>
			{/if}
			{#if data.lobby?.players.some((player) => player.fullUser?.displayName == data.user?.displayName) && !data.lobby.started}
				<form
					method="post"
					action="?/leaveLobby"
					use:enhance={() => {
						return async () => {
							excludedCards = ExcludedCards();
						};
					}}
				>
					<button class="btn btn-lg variant-outline-warning"> Leave Draft </button>
				</form>
			{:else if !data.lobby?.started && data.user?.authorization?.cubeDraft}
				<form
					method="post"
					action="?/joinLobby"
					use:enhance={() => {
						return async () => {
							excludedCards = ExcludedCards();
						};
					}}
				>
					<button class="btn btn-lg variant-outline-warning"> Join Draft </button>
				</form>
			{/if}
		</div>
	</div>
	<a href="/cubedraft" class="anchor">
		<iconify-icon icon="ion:chevron-back" width="24" height="24" />
		<span class="align-super"> Back to lobbies </span>
	</a>
	{#if !data.lobby?.started}
		<div class="flex flex-row space-x-4">
			<p><b>Lobby Name:</b> {data.lobby?.lobbyName}</p>
			<button on:click|preventDefault class="btn btn-sm p-0" use:clipboard={`${$page.url}`}>
				<iconify-icon
					icon="bi:share"
					width="24"
					height="24"
					style="color: rgba(var(--color-primary-500) / 1)"
					class="block"
				/>
			</button>
		</div>
		<div class="flex flex-row">
			<p class="font-bold mt-1">Creator: {data.lobby?.creator.name}</p>
			{#if data.canEditLobby}
				<div class="pl-20">
					<ChatDraftSlideToggle
						bind:checked={editing}
						label="Edit: "
						name="Edit"
						active="bg-primary-500"
					/>
				</div>
			{/if}
		</div>
		{#if !editing || !data.canEditLobby}
			<div class="space-y-2">
				<p><b>Round Duration:</b> {data.lobby?.duration}</p>
				<p><b>Selections per Round:</b> {data.lobby?.selections}</p>
				<p><b>Featured Card Mode:</b> {data.lobby?.featuredCardMode}</p>
				{#if data.lobby?.featuredCardMode && data.lobby.featuredCardMode != 'off'}
					<p><b>Featured Card:</b> {data.lobby?.featuredCardDefKey}</p>
				{/if}
				<p><b>Face Down Draft:</b> {data.lobby?.faceDownDraft ? 'Yes' : 'No'}</p>
				<p>
					<b>Removed Cards:</b>
					{#if data.lobby.removedCards.length > 0}
						{data.lobby.removedCards.join(', ')}
					{:else}
						None
					{/if}
				</p>
				<p><b>Quick Picks:</b> {data.lobby?.quickPick ? 'Yes' : 'No'}</p>
			</div>
		{:else}
			<form
				method="post"
				action="?/updateLobby"
				use:enhance={() => {
					return async () => {
						editing = false;
					};
				}}
			>
				<div class="grid grid-cols-2"><DurationSlider duration={data.lobby.duration} /></div>
				<div class="grid grid-cols-2">
					<SelectionCountSlider selectionCount={data.lobby.selections} />
				</div>
				<div class="pt-4 w-1/2">
					<FeaturedCardOptions
						cardPool={data.cardDb}
						bind:featuredCardSelect
						bind:featuredCardMode
						bind:customFeaturedCardDefKey
						bind:customFeaturedCardValidationMessage
					/>
				</div>
				<div class="pt-4">
					<ChatDraftSlideToggle
						label="Face Down Draft:"
						name="faceDownDraft"
						active="bg-primary-500"
						checked={data.lobby.faceDownDraft}
					/>
				</div>

				<div class="pt-4 flex flex-row">
					<p class="font-bold basis-28">Remove Cards:</p>

					<CardsSelector
						placeholder="Search for a Card to Remove"
						cards={data.cardDb.all}
						bind:selectedCards={cardsToRemove}
					/>

					{#if !compareArrays(data.lobby.removedCards, cardsToRemove)}
						<button
							class="btn btn-md variant-outline-warning h-min ml-4"
							type="button"
							on:click={() => {
								cardsToRemove = [...data.lobby.removedCards];
							}}>Reset</button
						>
					{/if}
				</div>

				<div class="pt-4">
					<ChatDraftSlideToggle
						label="Quick Picks:"
						name="quickPick"
						active="bg-primary-500"
						checked={data.lobby.quickPick}
					/>
				</div>

				<br /><br />
				<button class="btn btn-md variant-filled-tertiary" type="submit">Save</button>
			</form>
		{/if}
		<ChatDraftSlideToggle
			label="Show Card Pool"
			name="showCardPool"
			active="bg-primary-500"
			bind:checked={showCardPool}
		/>
		<div class="space-y-4 mb-4" hidden={!showCardPool}>
			<div>
				<b>Card Pool:</b>
				{data.lobby?.draftPool
					? data.lobby?.draftPool.map((card) => card.name).join(', ')
					: 'Full Collection'}
			</div>
			<div>
				<b>Excluded Cards:</b>
				{excludedCards && excludedCards.length > 0
					? excludedCards.map((card) => card.name).join(', ')
					: 'None'}
			</div>
		</div>
		{#if data.user && data.canEditLobby}
			<form method="post" action="?/startLobby" use:enhance>
				<button
					class="btn btn-lg variant-filled-primary"
					on:click={(event) => {
						if (editing) {
							if (
								!confirm(
									'You are currently editing the draft settings. Are you sure you want to start?'
								)
							)
								event.preventDefault();
						} else if (!data.lobby.players.every((player) => player.status == PlayerStatus.ready)) {
							if (!confirm('Not everyone is ready. Are you sure you want to start?'))
								event.preventDefault();
						}
					}}
				>
					Start Draft
				</button>
			</form>
		{/if}
		<h2 class="h2">Players</h2>
		{#if data.lobby?.players}
			<LobbyPlayerTable
				players={data.lobby?.players}
				canEditLobby={data.canEditLobby}
				user={data.lobby.players.find((player) => player.name == data.user?.channelName)}
				{now}
				update={() => {
					return async () => {
						excludedCards = ExcludedCards();
					};
				}}
				cardTotal={data.cardDb.all.length}
				canReady={data.canEditLobby ||
					!data.creatorInLobby ||
					data.creatorInLobby.status == PlayerStatus.ready}
			/>
		{/if}
	{:else if data.lobby.draftedDecks && (!data.user || !data.lobby.players.some((player) => player.fullUser?.id == data.user?.id))}
		<h2 class="h2">Player Drafts</h2>
		{#each data.lobby.draftedDecks.entries() as [key, value]}
			{@const playerSelected =
				data.lobby.players.find((player) => player.name == key)?.cardSelected || false}
			<DraftSummary name={key} currentDeck={value} headerClass="h3" {playerSelected} />
		{/each}
	{:else if data.draft?.currentChoice?.cards && data.draft.total < 12}
		<form
			class="mt-0"
			method="post"
			action="?/voteCard"
			use:enhance={({ formData }) => {
				selecting = true;
				selected =
					data.draft?.currentChoice?.cards[Number(formData.get('selection')?.toString())]
						.cardDefKey;
				return async ({ update }) => {
					await new Promise((fulfil) => setTimeout(fulfil, 250));
					await update({ reset: false });
					selecting = false;
				};
			}}
		>
			Select a card to draft by clicking on it.
			<section class="grid grid-cols-6 justify-items-center gap-4">
				{#each data.draft?.currentChoice?.cards as choice, index}
					<DraftChoice {choice} value={index} disabled={selecting} selecting={true} {selected} />
				{/each}
			</section>
		</form>

		<DraftSummary name={data.user?.displayName || ''} currentDeck={data.draft.cards} />

		{#if data.lobby.draftedDecks}
			<OpponentDraftSummaries
				draftedDecks={data.lobby.draftedDecks}
				player={data.user?.channelName || ''}
				players={data.lobby.players}
			/>
		{/if}
	{:else if data.draft}
		<CodeBlock language="Deck Code" class="break-words" code={GetDeckCode(data.draft.cards)} />
		<SnapDeck cards={data.draft.cards} />

		{#if data.lobby.draftedDecks}
			<OpponentDraftSummaries
				draftedDecks={data.lobby.draftedDecks}
				player={data.user?.channelName || ''}
				players={data.lobby.players}
			/>
		{/if}
	{/if}
</div>
