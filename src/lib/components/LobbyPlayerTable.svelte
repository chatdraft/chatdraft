<script lang="ts">
	import { enhance } from '$app/forms';
	import { PlayerStatus, type Player } from '$lib/snap/player';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import prettyMilliseconds from 'pretty-ms';

	export let now: number;
	export let players: Player[];
	export let canEditLobby;
	export let user: Player | undefined = undefined;
	export let cardTotal: number;
	$: ready = user?.status == PlayerStatus.ready;
	let toggleReadyBtn: HTMLButtonElement;
	export let update: () => () => Promise<void>;
	export let canReady = false;
</script>

<div class="table-container p-4">
	<table class="table table-hover table-compact text-center border-separate w-min overflow-scroll">
		<thead class="sticky top-0 divide-solid divide-y divide-primary-200 divide-x">
			<tr>
				<th class="table-cell-fit">#</th>
				<th class="table-cell-fit">Name</th>
				<th class="table-cell-fit text-center">Status</th>
				<th class="table-cell-fit">Collection</th>
				{#if canEditLobby}
					<th class="table-cell-fit">Collection Updated</th>
					<th class="table-cell-fit">Kick</th>
				{/if}
			</tr>
		</thead>
		<tbody class="divide-solid divide-y divide-primary-200">
			{#each players as player, index}
				<tr class="align-middle">
					<td class="table-cell-fit !align-middle">
						{index + 1}
					</td>
					<td class="table-cell-fit !align-middle">
						{player.name}
					</td>
					<td class="table-cell-fit !align-middle !whitespace-nowrap">
						{#if player.name == user?.name}
							<form method="post" action="?/togglePlayerReady" class="inline" use:enhance>
								<SlideToggle
									name="Ready"
									active="bg-primary-500"
									checked={ready}
									on:change={() => toggleReadyBtn.click()}
									size="sm"
									disabled={!canReady}
								/>
								<button bind:this={toggleReadyBtn} class="hidden collapse"> Ready</button>
							</form>
						{:else if player.status == PlayerStatus.ready}
							<iconify-icon
								icon="foundation:check"
								width="24"
								height="24"
								style="color: green"
								inline
							/>
						{:else}
							<iconify-icon
								icon="material-symbols:circle"
								width="24"
								height="24"
								style="color: yellow"
								inline
							/>
						{/if}
						<span class="float-end align-top">
							{player.status == PlayerStatus.ready ? 'Ready' : 'Not Ready'}
						</span>
					</td>
					<td class="table-cell-fit !align-middle">
						{player.collection ? `${player.collection.length} / ${cardTotal}` : 'Full'}
					</td>

					{#if canEditLobby}
						<td class="table-cell-fit !align-middle">
							{player.collectionLastUpdated
								? `${player.collectionLastUpdated.toLocaleString()} (${prettyMilliseconds(
										now - player.collectionLastUpdated.valueOf(),
										{ unitCount: 2, secondsDecimalDigits: 0 }
								  )} ago)`
								: 'Never'}
						</td>
						<td class="table-cell-fit !align-middle">
							{#if player.name != user?.name}
								<form method="post" action="?/removePlayer" use:enhance={update}>
									<input type="hidden" id="playerName" name="playerName" value={player.name} />
									<button class="btn-icon btn-icon-sm variant-outline-error">
										<iconify-icon icon="mdi:remove-bold" />
									</button>
								</form>
							{/if}
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
