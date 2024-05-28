<script lang="ts">
	import { enhance } from '$app/forms';
	import { EntrantStatus } from '$lib/event';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form;
</script>

<div class="p-4">
	<h1 class="h1">Event</h1>
	{#if !data.currentEvent}
		There is no event currently planned.
	{:else}
		{@const currentEntrant = data.currentEvent.entrants.find(
			(entrant) => data.user?.channelName == entrant.user.channelName
		)}
		{#if currentEntrant}
			{#if currentEntrant.status == EntrantStatus.Invited}
				<p>Welcome to the event. Please join.</p>
				<form method="post" action="?/join" use:enhance>
					<button class="btn btn-md variant-filled-primary mt-4">Join</button>
				</form>
			{:else if currentEntrant.status == EntrantStatus.Joined}
				<p>Welcome to the event. Please choose your drafting partner when ready.</p>
				<form method="post" action="?/ready" use:enhance>
					<b>Battle Viewer:</b>
					<input class="input w-64" type="text" name="battleChatter" placeholder="None" />
					{#if form?.battleChatterNotFound}
						<span class="text-error-500 font-bold">
							The user {form.battleChatter} was not found. Check spelling.
						</span>
					{/if}
					<br />
					<button class="btn btn-md variant-filled-primary mt-4">Ready</button>
					<button formaction="?/unjoin" class="btn btn-md variant-filled-warning mt-4">
						Unjoin
					</button>
				</form>
			{:else if currentEntrant.status == EntrantStatus.Ready}
				<form method="post" action="?/unready" use:enhance>
					<p>
						You are ready. Please wait for the draft event to start.
						<br />
						Your battle viewer: {currentEntrant.battleViewer ? currentEntrant.battleViewer : 'None'}
					</p>
					<button class="btn btn-md variant-filled-warning mt-4">Unready</button>
				</form>
			{/if}
		{:else if data.user}
			<p>Current event does not include your account. Please contact the event organizers.</p>
		{:else}
			<p>Please log in to join the event.</p>
		{/if}
	{/if}
</div>
