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

	export let data: PageData;
	let now = DatetimeNowUtc();

	let ws: WebSocket | null = null;

	let showCardPool = false;

	let selecting = false;
	let selected: string | undefined = data.selectedCard?.cardDefKey;

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

<div class="space-y-4 p-4">
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
		<p><b>Creator:</b> {data.lobby?.creator.name}</p>
		<p><b>Round Duration:</b> {data.lobby?.duration}</p>
		<p><b>Selections per Round:</b> {data.lobby?.selections}</p>
		<p><b>Featured Card Mode:</b> {data.lobby?.featuredCardMode}</p>
		{#if data.lobby?.featuredCardMode && data.lobby.featuredCardMode != 'off'}
			<p><b>Featured Card:</b> {data.lobby?.featuredCardDefKey}</p>
		{/if}
		<p><b>Face Down Draft:</b> {data.lobby?.faceDownDraft ? 'Yes' : 'No'}</p>
		<ChatDraftSlideToggle
			label="Show Card Pool"
			name="showCardPool"
			active="bg-primary-500"
			bind:checked={showCardPool}
		/>
		<p hidden={!showCardPool}>
			<b>Card Pool:</b>
			{data.lobby?.draftPool
				? data.lobby?.draftPool.map((card) => card.name).join(', ')
				: 'Full Collection'}
		</p>
		{#if data.user && data.lobby?.creator.fullUser?.id == data.user.id}
			<form method="post" action="?/startLobby" use:enhance>
				<button class="btn btn-lg variant-filled-primary"> Start Draft </button>
			</form>
		{/if}
		<h2 class="h2">Players</h2>
		{#if data.lobby?.players}
			<ul>
				{#each data.lobby?.players as player}
					<li>
						<p><b>Player Name:</b> {player.fullUser ? player.fullUser.displayName : player.name}</p>
					</li>
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
