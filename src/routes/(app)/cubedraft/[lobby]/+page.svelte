<script lang="ts">
	import { enhance } from '$app/forms';
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
	import { GetDeckCode } from '$lib/snap/cards';
	import { page } from '$app/stores';
	import { seconds_to_ms } from '$lib/constants';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import CardsSelector from '$lib/components/CardsSelector.svelte';
	import { compareArrays } from '$lib/snap/utils';
	import DurationSlider from '$lib/components/DurationSlider.svelte';
	import SelectionCountSlider from '$lib/components/SelectionCountSlider.svelte';
	import type { FeaturedCardMode } from '$lib/featuredCard';
	import FeaturedCardOptions from '$lib/components/FeaturedCardOptions.svelte';

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
			if (data.lobby.creator.fullUser?.id != data.user?.id)
				toastStore.trigger({
					message: `The lobby ${data.lobby.lobbyName} was closed by the creator.`
				});
			await goto('/cubedraft');
			return;
		}

		console.log(wsm);
		invalidateAll();
	};

	$: time_remaining = (data.lobby?.roundEndsAt! - now) / seconds_to_ms;

	let cardsToRemove: string[] = data.lobby.removedCards;

	const excludedCards = data.cardDb.all.filter(
		(card) =>
			data.lobby.removedCards.includes(card.cardDefKey) ||
			data.lobby.draftPool.every((card2) => card2.cardDefKey != card.cardDefKey)
	);

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
				Time Remaining: {time_remaining.toLocaleString(undefined, {
					minimumFractionDigits: 0,
					maximumFractionDigits: 0
				})}
			{/if}
		</section>

		<div class="grid justify-items-end">
			{#if data.lobby.creator.fullUser?.id == data.user?.id}
				<form method="post" action="?/closeLobby" use:enhance>
					<button class="btn btn-lg variant-outline-warning"> Close Lobby </button>
				</form>
			{:else if data.lobby?.players.some((player) => player.fullUser?.displayName == data.user?.displayName) && !data.lobby.started}
				<form method="post" action="?/leaveLobby" use:enhance>
					<button class="btn btn-lg variant-outline-warning"> Leave Draft </button>
				</form>
			{:else if !data.lobby?.started && data.user?.authorization?.cubeDraft}
				<form method="post" action="?/joinLobby" use:enhance>
					<button class="btn btn-lg variant-outline-warning"> Join Draft </button>
				</form>
			{/if}
		</div>
	</div>
	<a href="/cubedraft" class="anchor">
		<iconify-icon icon="ion:chevron-back" width="24" height="24" class="pt-4" />
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
			{#if data.lobby.creator.fullUser?.id == data.user?.id}
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
		{#if !editing || data.lobby.creator.fullUser?.id != data.user?.id}
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
						label="Face Down Draft"
						name="faceDownDraft"
						active="bg-primary-500"
						checked={false}
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
		{#if data.user && data.lobby?.creator.fullUser?.id == data.user.id}
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
						}
					}}
				>
					Start Draft
				</button>
			</form>
		{/if}
		<h2 class="h2">Players</h2>
		{#if data.lobby?.players}
			<ul>
				{#each data.lobby?.players as player, index}
					<form method="post" action="?/removePlayer" use:enhance>
						<li>
							<b>Player {index + 1}:</b>
							{player.fullUser ? player.fullUser.displayName : player.name}
							{#if data.lobby.creator.fullUser?.id == data.user?.id && player.fullUser?.id != data.user?.id}
								<input type="hidden" id="playerName" name="playerName" value={player.name} />
								<button class="btn-icon btn-icon-sm variant-outline-error">
									<iconify-icon icon="mdi:remove-bold" />
								</button>
							{/if}
						</li>
					</form>
				{/each}
			</ul>
		{/if}
	{:else if data.lobby.draftedDecks && (!data.user || !data.lobby.players.some((player) => player.fullUser?.id == data.user?.id))}
		<h2 class="h2">Player Drafts</h2>
		{#each data.lobby.draftedDecks.entries() as [key, value]}
			<DraftSummary name={key} currentDeck={value} headerClass="h3" />
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
			<hr />
			<h2 class="h2">Opponent Drafts</h2>
			{#each data.lobby.draftedDecks.entries() as [key, value]}
				{#if key != data.user?.channelName}
					<DraftSummary name={key} currentDeck={value} headerClass="h3" />
				{/if}
			{/each}
		{/if}
	{:else if data.draft}
		<CodeBlock language="Deck Code" class="break-words" code={GetDeckCode(data.draft.cards)} />
		<SnapDeck cards={data.draft.cards} />

		{#if data.lobby.draftedDecks}
			<hr />
			<h1 class="h1">Opponent Drafts</h1>
			{#each data.lobby.draftedDecks.entries() as [key, value]}
				{#if key != data.user?.channelName}
					<DraftSummary name={key} currentDeck={value} headerClass="h3" />
				{/if}
			{/each}
		{/if}
	{/if}
</div>
