<script lang="ts">
	import { enhance } from '$app/forms';
	import { Accordion, AccordionItem, clipboard, popup } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { title } from '$lib/title';
	import { OtdStatus } from '$lib/snap/draft';

	export let data: PageData;
	export let form;

	title.set('Oro Chat Draft - Organizer');
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
	<section>
		<h1 class="h1">Organizer</h1>
		<br />
		<form method="POST" action="?/viewOtdBatch" use:enhance>
			<label for="otdraftBatchTag" class="label">One Time Draft Batch Tag:</label>
			<select class="select w-64" name="otdraftBatchTag">
				<option value="">Select an OTD Batch to View</option>
				{#each data.otdBatches || [] as otdBatch}
					<option value={otdBatch.tag}>{otdBatch.tag}</option>
				{/each}
			</select>
			<button class="btn variant-filled-primary">View OTD Batch</button>
			{#if form?.otdBatchTagMissing}
				<span class="text-error-500 font-bold">* Please select an OTD Batch Tag</span>
			{/if}
		</form>
	</section>
	{#if form?.otdBatch}
		<hr class="m-4" />
		<h2 class="h2">OTD Batch:</h2>
		<p>Batch Tag: {form.otdBatch.tag}</p>
		<p>Batch Expiration: {form.otdBatch.expiration.toLocaleDateString()}</p>
		<p>Batch OTD Count: {form.otdBatch.drafts.length}</p>
		<p>Draft Expiration Time: {form.otdBatch.draftExpiration} minutes</p>
		<p>
			Batch OTD Organizers: {form.otdBatch.organizers
				.map((organizer) => organizer.channelName)
				.join(', ')}
		</p>
		<Accordion regionControl="flex-row-reverse gap-4">
			<AccordionItem>
				<svelte:fragment slot="summary">Batch Card Pool</svelte:fragment>
				<svelte:fragment slot="content">
					<p class="text-wrap">{form.otdBatch.cardPool.replaceAll(',', ', ')}</p>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
		<h3 class="h3">One Time Drafts</h3>
		<div class="table-container">
			<table class="table table-hover table-compact text-center border-collapse">
				<thead>
					<tr>
						<th class="p-4 table-cell-fit">Status</th>
						<th class="p-4 table-cell-fit text-center">User</th>
						<th class="p-4 text-center table-cell-fit">Started</th>
						<th class="p-4 text-center table-cell-fit">Finished</th>
						<th class="p-4 text-center table-cell">OTD Link</th>
						<th class="table-cell-fit" />
					</tr>
				</thead>
				<tbody>
					{#each form.otdBatch.drafts as draft, index}
						<tr class="align-middle">
							<td class="table-cell-fit">
								{#if form.otdStatuses}
									{#if form.otdStatuses[index] == OtdStatus.Unused}
										<iconify-icon
											icon="mdi:play"
											width="24"
											height="24"
											style="color: transparent"
											use:popup={{
												event: 'hover',
												target: form.otdStatuses[index],
												placement: 'top'
											}}
										/>
										<div
											class="card p-4 variant-filled-secondary duration-0"
											data-popup={form.otdStatuses[index]}
										>
											<b>Unused</b>
											<div class="arrow variant-filled-secondary" />
										</div>
									{:else if form.otdStatuses[index] == OtdStatus.Started}
										<iconify-icon
											icon="mdi:play"
											width="24"
											height="24"
											style="color: yellow"
											use:popup={{
												event: 'hover',
												target: form.otdStatuses[index],
												placement: 'top'
											}}
										/>
										<div
											class="card p-4 variant-filled-secondary duration-0"
											data-popup={form.otdStatuses[index]}
										>
											<b>Started</b>
											<div class="arrow variant-filled-secondary" />
										</div>
									{:else if form.otdStatuses[index] == OtdStatus.Finished}
										<iconify-icon
											icon="foundation:check"
											width="24"
											height="24"
											style="color: green"
											inline
											use:popup={{
												event: 'hover',
												target: form.otdStatuses[index],
												placement: 'top'
											}}
										/>
										<div
											class="card p-4 variant-filled-secondary duration-0"
											data-popup={form.otdStatuses[index]}
										>
											<b>Finished</b>
											<div class="arrow variant-filled-secondary" />
										</div>
									{:else if form.otdStatuses[index] == OtdStatus.LinkExpired}
										<iconify-icon
											icon="foundation:x"
											width="24"
											height="24"
											style="color: red"
											inline
											use:popup={{
												event: 'hover',
												target: form.otdStatuses[index],
												placement: 'top'
											}}
										/>
										<div
											class="card p-4 variant-filled-secondary duration-0"
											data-popup={form.otdStatuses[index]}
										>
											<b>Link Expired</b>
											<div class="arrow variant-filled-secondary" />
										</div>
									{:else if form.otdStatuses[index] == OtdStatus.DraftExpired}
										<iconify-icon
											icon="foundation:x-circle"
											width="24"
											height="24"
											style="color: red"
											use:popup={{
												event: 'hover',
												target: form.otdStatuses[index],
												placement: 'top'
											}}
										/>
										<div
											class="card p-4 variant-filled-secondary duration-0"
											data-popup={form.otdStatuses[index]}
										>
											<b>Draft Expired</b>
											<div class="arrow variant-filled-secondary" />
										</div>
									{/if}
								{/if}
							</td>
							<td class="table-cell-fit">
								{#if draft.user}
									{draft.user}
								{/if}
							</td>
							<td class="table-cell-fit !whitespace-normal lg:!whitespace-nowrap">
								{draft.startedAt?.toLocaleString() || ''}
							</td>
							<td class="table-cell-fit !whitespace-normal lg:!whitespace-nowrap">
								{draft.finishedAt?.toLocaleString() || ''}
							</td>
							<td class="table-cell whitespace-nowrap">
								<a class="anchor" href="{$page.url.origin}/otdraft?code={draft.id}" target="_blank">
									{draft.id}
								</a>
							</td>
							<td>
								<button
									on:click|preventDefault
									class="btn btn-icon variant-filled-primary btn-icon-sm"
									use:clipboard={`${$page.url.origin}/otdraft?code=${draft.id}`}
								>
									<iconify-icon
										icon="clarity:copy-to-clipboard-line"
										width="16"
										height="16"
										flip="horizontal"
									/>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
