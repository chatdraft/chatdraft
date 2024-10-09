<script lang="ts">
	import { enhance } from '$app/forms';
	import DurationSlider from '$lib/components/DurationSlider.svelte';
	import FeaturedCardOptions from '$lib/components/FeaturedCardOptions.svelte';
	import SelectionCountSlider from '$lib/components/SelectionCountSlider.svelte';
	import { title } from '$lib/title';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { type FeaturedCardMode } from '$lib/featuredCard';
	import ChatDraftSlideToggle from '$lib/components/ChatDraftSlideToggle.svelte';

	export let data: PageData;

	let duration = 90;
	let selectionCount = 6;

	let featuredCardSelect: 'seasonpass' | 'spotlight' | 'custom' | undefined;
	let featuredCardMode: FeaturedCardMode = 'off';
	let customFeaturedCardDefKey: string = '';

	let customFeaturedCardValidationMessage = '';

	let showFinishedDrafts = false;

	title.set('Oro Chat Draft - Cube Draft');
</script>

<svelte:head>
	<meta name="description" content="Start a Marvel Snap Cube Draft" />
</svelte:head>

<div class="space-y-4 p-4">
	<h1 class="h1">Cube Draft</h1>
	<h2 class="h2">Lobbies</h2>
	{data.lobbies.filter((lobby) => !lobby.finished).length} Active Lobbies
	<ChatDraftSlideToggle
		bind:checked={showFinishedDrafts}
		label="Show Finished Drafts"
		name="showFinishedDrafts"
		active="bg-secondary-500"
	/>
	<div class="table-container">
		<table class="table table-hover table-compact text-center border-collapse w-min">
			<thead>
				<tr>
					<th class="table-cell-fit">Lobby Name</th>
					<th class="table-cell-fit text-center">Creator</th>
					<th class="text-center table-cell-fit">Players</th>
					<th class="text-center table-cell-fit">Round Duration</th>
					<th class="text-left table-cell">Choices</th>
					<th class="text-left table-cell">Featured Card</th>
					<th class="text-left table-cell">Started?</th>
					<th class="text-left table-cell">Finished?</th>
				</tr>
			</thead>
			<tbody>
				{#each data.lobbies as lobby}
					{#if !lobby.finished || showFinishedDrafts}
						<tr class="align-middle">
							<td class="table-cell-fit !align-middle">
								<a class="anchor" href={`/cubedraft/${lobby.lobbyName}`}>{lobby.lobbyName}</a>
							</td>
							<td class="table-cell-fit !align-middle">
								{lobby.creator.name}
							</td>
							<td class="table-cell-fit !align-middle">
								{lobby.players.length}
							</td>
							<td class="table-cell-fit !align-middle">
								{lobby.duration}
							</td>
							<td class="table-cell-fit !align-middle">
								{lobby.selections}
							</td>
							<td class="table-cell-fit !align-middle">
								{lobby.featuredCardMode}
							</td>
							<td class="table-cell-fit !align-middle">
								{lobby.started ? 'Yes' : 'No'}
							</td>
							<td class="table-cell-fit !align-middle">
								{lobby.finished ? 'Yes' : 'No'}
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>

	{#if (data.user && data.user.authorization?.cubeDraftCreateLobby) || data.user?.isAdmin}
		<hr />
		<h3 class="h3">Create New Lobby</h3>
		<form
			method="post"
			action="?/newLobby"
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
				return async ({ update }) => {
					featuredCardMode = 'off';
					featuredCardSelect = undefined;
					customFeaturedCardDefKey = '';
					customFeaturedCardValidationMessage = '';
					update();
				};
			}}
		>
			<div class="flex flex-col space-y-4">
				<div class="flex flex-row">
					<p class="font-bold basis-28">Lobby Name:</p>
					<input
						class="input w-1/2"
						name="lobbyName"
						type="text"
						required
						placeholder="Enter Lobby Name"
					/>
				</div>
			</div>
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
						<FeaturedCardOptions
							cardPool={data.cardPool}
							bind:featuredCardSelect
							bind:featuredCardMode
							bind:customFeaturedCardDefKey
							bind:customFeaturedCardValidationMessage
						/>
						<ChatDraftSlideToggle
							label="Face Down Draft"
							name="faceDownDraft"
							active="bg-primary-500"
							checked={false}
						/>
					</svelte:fragment>
				</AccordionItem>
			</Accordion>
			<br />
			<button class="btn btn-lg variant-filled-primary mt-2">Create Lobby</button><br />
		</form>
	{/if}
</div>
