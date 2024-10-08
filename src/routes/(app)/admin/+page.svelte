<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { AccordionItem, FileDropzone, InputChip, popup } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { getToastStore, Accordion } from '@skeletonlabs/skeleton';
	import { title } from '$lib/title';
	import DurationSlider from '$lib/components/DurationSlider.svelte';
	import SelectionCountSlider from '$lib/components/SelectionCountSlider.svelte';
	import { EntrantStatus } from '$lib/event';
	import type { CardDb } from '$lib/snap/cards';
	import { LookupCard } from '$lib/snap/cards';
	import FeaturedCardOptions from '$lib/components/FeaturedCardOptions.svelte';
	import UserManagementTable from '$lib/components/UserManagementTable.svelte';

	const toastStore = getToastStore();

	export let data: PageData;
	$: drafts = data.drafts;
	$: previousDrafts = data.previousDrafts;
	$: channels = data.channels!;

	let cardDbFiles: FileList;
	let otdBatchFiles: FileList;

	let cardDb: CardDb = data.cardDb;

	let organizerList: string[] = [];
	let organizerInputChip: InputChip;

	let currentEventDuration: number = 90;
	let currentEventSelections: number = 6;

	export let form;

	title.set('Oro Chat Draft - Admin');

	async function RefreshCardDb() {
		const cardsReq = await fetch('api/v1/cards');
		if (cardsReq.ok) {
			cardDb = await cardsReq.json();
		}
	}
</script>

<svelte:head>
	<meta
		name="description"
		content="Oro Chat Draft is a fun app for letting Twitch Chat draft a Marvel Snap Deck for a streamer to play."
	/>
	<meta
		name="robots"
		content="follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large"
	/>
</svelte:head>

<section class="p-4">
	<h1 class="h1">Admin</h1>
	<br />
	<button class="btn-icon btn-icon-sm variant-filled-primary" on:click={() => invalidateAll()}
		><iconify-icon icon="material-symbols:refresh" /></button
	>
	Refresh
	<br />
	<hr class="m-4" />
	<form
		method="POST"
		action="?/updatecards"
		enctype="multipart/form-data"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type == 'success') {
					toastStore.trigger({ message: 'Card database successfully updated.' });
				}
				update();
			};
		}}
	>
		<h3 class="h3">Update card database</h3>
		<FileDropzone
			name="files"
			bind:files={cardDbFiles}
			class="m-4 w-1/3"
			multiple={false}
			accept=".json"
			required
		>
			<svelte:fragment slot="message">
				{#if cardDbFiles && cardDbFiles.length > 0}
					{cardDbFiles[0].name} selected.
				{:else}
					Please select an updated cards.json file
				{/if}
			</svelte:fragment>
		</FileDropzone>
		<button class="btn btn-md variant-filled-primary m-4" type="submit">Submit</button>
		{#if form?.updated}
			Successfully updated card database.
		{/if}
	</form>
	<a class="anchor" href="api/v1/cards" target="#">
		Check current card database
		<iconify-icon icon="fluent:window-new-16-filled" width="16" height="16" />
	</a>
	<Accordion regionControl="flex-row-reverse gap-4 text-primary-500 font-bold">
		<AccordionItem on:toggle={RefreshCardDb}>
			<svelte:fragment slot="summary">All Cards</svelte:fragment>
			<svelte:fragment slot="content">
				{#if cardDb}
					<p class="text-wrap">{cardDb.all.map((card) => card.name).join(', ')}</p>
				{/if}
			</svelte:fragment>
		</AccordionItem>
	</Accordion>
	<form
		method="POST"
		action="?/resetcards"
		use:enhance={({ cancel }) => {
			if (!confirm('Are you sure you want to reset the card database to installed default?')) {
				cancel();
			}

			return async ({ result, update }) => {
				if (result.type == 'success') {
					toastStore.trigger({ message: 'Card database successfully reset to build settings.' });
				}
				update();
			};
		}}
	>
		<button class="btn btn-md variant-outline-warning m-4" type="submit"
			>Reset to default card database</button
		>
		{#if form?.reset}
			Successfully reset card database.
		{/if}
	</form>
	<hr class="m-4" />
	<h3 class="h3">User Management</h3>
	<UserManagementTable users={data.users} />

	<hr class="m-4" />
	<form method="POST" action="?/authorize" use:enhance>
		<label for="username">Authorize User for Chat Draft:</label>
		<input type="text" id="username" name="username" placeholder="Username" class="input w-64" />
		<button class="btn-icon btn-icon-sm variant-outline-primary"
			><iconify-icon icon="mdi:check-bold" /></button
		>
	</form>
	<hr class="m-4" />
	<section>Chatbot is connected to:</section>
	<ul class="list-disc list-inside">
		{#each channels as channel, index}
			<form method="POST" action="?/partchannel" use:enhance>
				<li>
					<button class="btn-icon btn-icon-sm variant-outline-error">
						<iconify-icon icon="mdi:remove-bold" />
					</button>
					{channel}
					<input type="hidden" id="username" name="username" value={channel} />
					{#if data.joinedChannels[index]}
						<iconify-icon
							icon="foundation:check"
							width="24"
							height="24"
							style="color: green"
							inline
						/>
					{:else}
						<iconify-icon icon="foundation:x" width="24" height="24" style="color: red" inline />
					{/if}
				</li>
			</form>
		{/each}
	</ul>
	<form method="POST" action="?/joinchannel" use:enhance>
		<label for="username">Join Channel:</label>
		<input type="text" id="username" name="username" placeholder="Username" class="input w-64" />
		<button class="btn-icon btn-icon-sm variant-outline-primary"
			><iconify-icon icon="mdi:check-bold" /></button
		>
	</form>
	<form
		method="POST"
		action="?/rejoinchannels"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type == 'success') {
					invalidateAll();
					update();
				}
			};
		}}
	>
		<button class="btn btn-md variant-outline-secondary mt-2"> Rejoin Channels </button>
	</form>
	<br />
	<hr class="m-4" />

	<section>
		<h3>Generate One Time Draft Links</h3>
		<form
			method="post"
			action="?/generateOtdLinks"
			enctype="multipart/form-data"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type == 'success' && form?.dataUri) {
						toastStore.trigger({ message: 'One Time Draft Links successfully generated.' });
					}
					update();
				};
			}}
		>
			<p>Batch Tag:</p>
			<input
				type="text"
				name="otdBatchTag"
				placeholder="OTD Batch Tag"
				class="input w-64"
				value={form?.tagData ?? ''}
			/>
			{#if form?.missingTag}
				<span class="text-error-500 font-bold">* The Batch Tag field is required.</span>
			{/if}
			{#if form?.alreadyExists}
				<span class="text-error-500 font-bold">
					* The Batch Tag '{form?.tagData}' has already been used.
				</span>
			{/if}
			<br />
			<p>Number of Links:</p>
			<input
				type="number"
				name="otdCount"
				placeholder="# OTD Links"
				class="input w-64"
				value={form?.countData ?? ''}
			/>
			{#if form?.missingCount}
				<span class="text-error-500 font-bold">* The # of Links field is required.</span>
			{/if}
			{#if form?.countZeroOrNegative}
				<span class="text-error-500 font-bold">* The # of Links must be greater than 0.</span>
			{/if}
			<br />
			<br />
			OTD Links Expiration:<br />
			<input
				type="date"
				title="OTD Link Expiration"
				name="otdExpiration"
				class="input w-64"
				value={form?.expirationData ?? ''}
			/>
			{#if form?.missingExpiration}
				<span class="text-error-500 font-bold">* The Expiration field is required.</span>
			{/if}
			<br /><br />
			Draft Expiration (minutes): <br />
			<input
				type="number"
				title="Draft Expiration (minutes)"
				name="draftExpiration"
				class="input w-64"
				value={form?.draftExpirationData ?? 60}
			/>
			{#if form?.missingDraftExpiration}
				<span class="text-error-500 font-bold">* The Expiration field is required.</span>
			{/if}
			{#if form?.draftExpirationZeroOrNegative}
				<span class="text-error-500 font-bold">* The Draft expiration must be greater than 0.</span>
			{/if}
			<br /><FileDropzone
				name="files"
				bind:files={otdBatchFiles}
				class="m-4 w-1/3"
				multiple={false}
				accept=".json"
				required
			>
				<svelte:fragment slot="message">
					{#if otdBatchFiles && otdBatchFiles.length > 0}
						{otdBatchFiles[0].name} selected.
					{:else}
						Please select a cards.json file to use for this batch
					{/if}
				</svelte:fragment>
			</FileDropzone>
			<button class="btn btn-md variant-filled-primary mt-4">Generate</button>
		</form>
		{#if form?.dataUri}
			<a href={form.dataUri} class="anchor" download="{form.tag}.txt">
				{form.tag}
				<iconify-icon icon="ion:download" />
			</a>
		{/if}
	</section>

	<hr class="m-4" />
	<section>
		<h3>Check OTD Batch</h3>
		<form method="post" action="?/getOtdBatch" use:enhance>
			<select class="select w-64" name="tagData">
				<option value="">Select an OTD Batch to View</option>
				{#each data.otdBatches || [] as otdBatch}
					<option value={otdBatch.tag}>{otdBatch.tag}</option>
				{/each}
			</select>
			{#if form?.checkMissingTag}
				<span class="text-error-500 font-bold">* The Batch Tag field is required.</span>
			{/if}
			{#if form?.batchNotFound}
				<span class="text-error-500 font-bold">* The supplied batch tag was not found.</span>
			{/if}
			<br />
			<button class="btn btn-md variant-filled-primary mt-4">Check</button>
		</form>
		{#if form?.batch}
			<br />
			<p><b>Batch Tag:</b> {form.batch.tag}</p>
			<p><b>Batch Expiration:</b> {form.batch.expiration.toLocaleDateString()}</p>
			<p><b>Batch OTD Count:</b> {form.batch.drafts.length}</p>
			<Accordion regionControl="flex-row-reverse gap-4 text-primary-500">
				<AccordionItem>
					<svelte:fragment slot="summary">Batch Card Pool</svelte:fragment>
					<svelte:fragment slot="content">
						<p class="text-wrap">{form.batch.cardPool.replaceAll(',', ', ')}</p>
					</svelte:fragment>
				</AccordionItem>
			</Accordion>
		{/if}
		{#if form?.checkDataUri}
			<b>Batch Links:</b>
			<a href={form.checkDataUri} class="anchor" download="{form.batch.tag}.txt">
				{form.batch.tag}
				<iconify-icon icon="ion:download" />
			</a>
			<br />

			<form
				method="post"
				action="?/updateBatchOrganizers"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type == 'success') {
							toastStore.trigger({ message: 'Organizers successfully updated.' });
						}
					};
				}}
			>
				<input type="hidden" value={form.batch.id} name="batchId" />
				<b>Organizers:</b> <br />
				<InputChip
					value={form.batch.organizers.map((organizer) => organizer.channelName)}
					bind:this={organizerInputChip}
					name="organizers"
					placeholder="Enter an organizer name"
					whitelist={data.organizers}
					class="w-1/2 m-4"
				/>
				<button class="btn btn-md variant-filled-primary mt-4">Update Organizers</button>
			</form>
		{/if}
	</section>
	<hr class="m-4" />
	<section>
		<h3 class="h3 inline">Current Event</h3>
		{#if data.currentEvent}
			<button
				class="btn-icon btn-icon-sm variant-filled-primary mx-4"
				on:click={() => invalidateAll()}
			>
				<iconify-icon icon="material-symbols:refresh" />
			</button>
			{#if !data.botFollowers}
				<span class="text-error-500 font-bold"
					>* Unable to load bot follower status. Please setup chatbot again.</span
				>
			{/if}
			<p>Duration: {data.currentEvent.duration} seconds</p>

			<p>Selections: {data.currentEvent.selections}</p>

			<p>Featured Card Mode: {data.currentEvent.featuredCardMode}</p>

			<p>Featured Card: {LookupCard(cardDb.all, data.currentEvent.featuredCardKey).name}</p>

			<div class="table-container">
				<table class="table table-hover table-compact text-center border-collapse w-min">
					<thead>
						<tr>
							<th class="table-cell-fit">Status</th>
							<th class="table-cell-fit text-center">User</th>
							<th class="text-center table-cell-fit">Battle Viewer</th>
							<th class="text-center table-cell-fit">Following</th>
							<th class="text-center table-cell-fit">Remove</th>
						</tr>
					</thead>
					<tbody>
						{#each data.currentEvent.entrants as entrant}
							<tr class="align-middle">
								<td>
									{#if entrant.status == EntrantStatus.Invited}
										<iconify-icon
											icon="material-symbols:circle"
											width="24"
											height="24"
											style="color: red"
											inline
											use:popup={{
												event: 'hover',
												target: entrant.status,
												placement: 'top'
											}}
										/>
										<div
											class="card p-4 variant-filled-secondary duration-0"
											data-popup={entrant.status}
										>
											<b>Invited</b>
											<div class="arrow variant-filled-secondary" />
										</div>
									{:else if entrant.status == EntrantStatus.Joined}
										<iconify-icon
											icon="mdi:minus"
											width="24"
											height="24"
											style="color: yellow"
											inline
											use:popup={{
												event: 'hover',
												target: entrant.status,
												placement: 'top'
											}}
										/>
										<div
											class="card p-4 variant-filled-secondary duration-0"
											data-popup={entrant.status}
										>
											<b>Joined</b>
											<div class="arrow variant-filled-secondary" />
										</div>
									{:else if entrant.status == EntrantStatus.Ready}
										<iconify-icon
											icon="foundation:check"
											width="24"
											height="24"
											style="color: green"
											inline
											use:popup={{
												event: 'hover',
												target: entrant.status,
												placement: 'top'
											}}
										/>
										<div
											class="card p-4 variant-filled-secondary duration-0"
											data-popup={entrant.status}
										>
											<b>Ready</b>
											<div class="arrow variant-filled-secondary" />
										</div>
									{/if}
								</td>
								<td>
									{entrant.user.channelName}
								</td>
								<td>
									{entrant.battleViewer
										? entrant.battleViewer
										: entrant.status == EntrantStatus.Ready
										? 'No one'
										: 'No one yet'}
								</td>
								<td>
									{#if data.botFollowers}
										{#if entrant.battleViewer && data.botFollowers.find((follower) => follower.viewer === entrant.battleViewer)?.following}
											<iconify-icon
												icon="foundation:check"
												width="24"
												height="24"
												style="color: green"
												inline
											/>
										{:else if entrant.battleViewer}
											<iconify-icon
												icon="foundation:x"
												width="24"
												height="24"
												style="color: red"
												inline
												class="align-middle"
											/>
										{/if}
									{:else}
										<iconify-icon
											icon="fluent:question-24-filled"
											width="24"
											height="24"
											style="color: white"
											inline
											class="align-middle"
										/>
									{/if}
								</td>
								<td>
									<form method="post" action="?/removeEventEntrant" use:enhance>
										<input type="hidden" value={entrant.user.channelName} name="removedEntrant" />
										<button class="btn-icon btn-icon-sm variant-outline-error">
											<iconify-icon icon="mdi:remove-bold" />
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if !data.currentEvent.started}
				<form method="post" action="?/addEntrant" use:enhance class="mt-4">
					<input class="input w-64" type="text" name="newEntrant" placeholder="New entrant" />
					{#if form?.newEntrantUnspecified}
						<span class="text-error-500 font-bold">* New entrant name is required</span>
					{/if}
					{#if form?.entrantNotFound}
						<span class="text-error-500 font-bold">* User not found. Check spelling. </span>
					{/if}
					{#if form?.userAlreadyEntered}
						<span class="text-error-500 font-bold">* User is already entered into event. </span>
					{/if}
					<button class="btn btn-sm variant-filled-primary">Add</button>
				</form>
				<form
					method="post"
					action="?/startEvent"
					class="inline"
					use:enhance={({ cancel }) => {
						if (data.currentEvent) {
							const readyUsers = data.currentEvent?.entrants.filter(
								(entrant) => entrant.status == EntrantStatus.Ready
							);
							if (readyUsers.length < 2) {
								alert('At least two users must be ready in order to start the event.');
								cancel();
							}
						} else {
							cancel();
						}
					}}
				>
					<button class="btn btn-md variant-filled-primary mt-4"> Start Event </button>
				</form>
				<form method="post" action="?/cancelEvent" use:enhance class="inline-block">
					<button class="btn btn-md variant-filled-warning mt-4"> Cancel Event </button>
				</form>
			{:else}
				<form method="post" action="?/cancelEvent" use:enhance>
					<button class="btn btn-md variant-filled-warning mt-4"> Finish Event </button>
				</form>
			{/if}
		{:else}
			<form method="post" action="?/createEvent" use:enhance>
				<div class="grid grid-cols-2">
					<DurationSlider bind:duration={currentEventDuration} name="eventDuration" />
				</div>
				<div class="grid grid-cols-2">
					<SelectionCountSlider
						bind:selectionCount={currentEventSelections}
						name="eventSelections"
					/>
				</div>
				<InputChip
					name="entrants"
					placeholder="Enter an entrant name"
					whitelist={data.authorizedUsers}
					class="w-1/2 m-4"
				/>

				{#if form?.entrantsUnspecified}
					<span class="text-error-500 font-bold">* At least two entrants must be specified.</span>
				{/if}
				<Accordion regionControl="flex-row-reverse gap-4 text-primary-500" width="w-1/2">
					<AccordionItem>
						<svelte:fragment slot="summary">Advanced</svelte:fragment>
						<svelte:fragment slot="content">
							<FeaturedCardOptions cardPool={cardDb} />
						</svelte:fragment>
					</AccordionItem>
				</Accordion>
				<br />
				<button class="btn btn-md variant-filled-primary mt-4">Create Event</button>
			</form>
		{/if}
	</section>
	<hr class="m-4" />
	<section>Number of Active Drafts: {drafts.length}</section>

	<ul class="list-disc list-inside">
		{#each drafts as draft}
			<li>
				Draft Player: {draft.player}
				<br />
				Draft Duration: {draft.duration}
				<br />
				Draft Round: {draft.total + 1}
			</li>
		{/each}
	</ul>

	<br />
	<hr class="m-4" />
	<section>Number of Previous Drafts: {previousDrafts.length}</section>
	<ul class="list-disc list-inside">
		{#each previousDrafts as draft}
			<li>
				Draft Player: {draft.player}
				<br />
				Draft Duration: {draft.duration}
				<br />
				Draft Round: {draft.total + 1}
			</li>
		{/each}
	</ul>
	<hr class="m-4" />
</section>
