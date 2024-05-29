<script lang="ts">
	import { enhance } from '$app/forms';
	import { EntrantStatus } from '$lib/event';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form;
</script>

<div class="space-y-4 p-4">
	<h1 class="h1">Event</h1>
	{#if !data.currentEvent}
		<p>No active events.</p>
	{:else}
		{@const currentEntrant = data.currentEvent.entrants.find(
			(entrant) => data.user?.channelName == entrant.user.channelName
		)}
		{#if currentEntrant}
			{#if currentEntrant.status == EntrantStatus.Invited}
				<p>Welcome to the Rolk Invitational Part Deux. Click ‘Join’ to enter the lobby.</p>
				<form method="post" action="?/join" use:enhance>
					<button class="btn btn-md variant-filled-primary">Join</button>
				</form>
			{:else if currentEntrant.status == EntrantStatus.Joined}
				<p>
					Rolk Invitational Part Deux requires viewer participation. Input the Twitch name for the
					viewer drafter and click ‘Ready’ to complete event set up.
				</p>
				<form method="post" action="?/ready" use:enhance>
					<label class="font-bold inline-block" for="battleChatter_0"
						>Viewer Drafter:
						<input
							class="input w-64"
							type="text"
							name="battleChatter"
							placeholder="None"
							id="battleChatter_0"
						/>
					</label>
					{#if form?.battleChatterNotFound}
						<span class="text-error-500 font-bold">
							User {form.battleChatter} not found. Check spelling.
						</span>
					{/if}
					<div class="mt-4">
					<button class="btn btn-md variant-filled-primary">Ready</button>
					<button formaction="?/unjoin" class="btn btn-md variant-filled-warning">Leave</button>
				</div>
				</form>
			{:else if currentEntrant.status == EntrantStatus.Ready}
				<form method="post" action="?/unready" use:enhance>
					<p class="font-bold">
						Ready!</p>
						<p>
						Viewer Drafter: {currentEntrant.battleViewer ? currentEntrant.battleViewer : 'None'}<br/>
						Event drafts will be launched by administrator.
					</p>
					<button class="btn btn-md variant-filled-warning mt-4">Not Ready</button>
				</form>
			{/if}
		{:else if data.user}
			<p>No active events for user.</p>
		{:else}
			<p>Log in required for events.</p>
		{/if}
	{/if}
</div>
