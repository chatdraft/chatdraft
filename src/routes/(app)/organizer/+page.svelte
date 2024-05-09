<script lang="ts">
	import { enhance } from '$app/forms';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { title } from '$lib/title';

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
		<Accordion>
			<AccordionItem>
				<svelte:fragment slot="summary">Batch Card Pool</svelte:fragment>
				<svelte:fragment slot="content">
					<p class="text-wrap">{form.otdBatch.cardPool.replaceAll(',', ', ')}</p>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
		<h3 class="h3">One Time Drafts</h3>
		<ul class="list-disc list-inside">
			{#each form.otdBatch.drafts as draft, index}
				<li class="list-item">
					<a class="anchor" href="{$page.url.origin}/otdraft?code={draft.id}">{draft.id}</a> -
					{#if form.otdStatuses}
						{form.otdStatuses[index]}
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
