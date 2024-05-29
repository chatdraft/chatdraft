<script lang="ts">
	import { Step, Stepper, getToastStore } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import SnapFanApiInput from '$lib/components/SnapFanApiInput.svelte';
	import { WebSocketMessageType, establishWebSocket, type WebSocketMessage } from '$lib/websocket';
	import { title } from '$lib/title';

	const toastStore = getToastStore();

	export let data: PageData;

	let full_source_configured = false;
	let deck_sources_configured = false;
	let choices_sources_configured = false;

	let skipSnapFan = false;
	let snapFanApiKey = '';

	let ws: WebSocket | null = null;

	const handleMessage = async (message: string) => {
		const wsm: WebSocketMessage = JSON.parse(message);
		if (wsm.type == WebSocketMessageType.BrowserUpdated) {
			const obj = JSON.parse(wsm.message!);
			full_source_configured = obj.full_source_configured;
			deck_sources_configured = obj.deck_sources_configured;
			choices_sources_configured = obj.choice_sources_configured;
		}
	};

	onMount(async () => {
		if (!data.user) {
			goto('/');
		}
		ws = await establishWebSocket(handleMessage);
	});

	let setupForm: HTMLFormElement;

	async function onComplete() {
		const res = await fetch(setupForm.action, {
			method: setupForm.method,
			body: new FormData(setupForm)
		});
		if (res.ok) {
			goto('/draft');
		}
	}

	title.set('Oro Chat Draft - Get Started');
</script>

<svelte:head>
	<meta
		name="description"
		content="Get Started with Oro Chat Draft and run a Marvel Snap Twitch Chat Draft"
	/>
</svelte:head>

{#if data.user}
	<div class="p-4">
		<h1 class="h1">Getting Started</h1>
		<br />
		<form method="POST" action="?/completeSetup" bind:this={setupForm}>
			<Stepper buttonCompleteLabel="Finish" on:complete={onComplete}>
				<Step locked={data.user == undefined}>
					<svelte:fragment slot="header">User Registration</svelte:fragment>
					<p>
						<iconify-icon
							icon="foundation:check"
							width="24"
							height="24"
							style="color: green"
							inline
						/>
						Successfully authenticated with Twitch! Now logged into Oro Chat Draft!
					</p>
					<br />
					<p>Click ‘Next’ to invite the chat draft bot to your Twitch channel.</p>
				</Step>
				<Step locked={!data.botInChannel}>
					<svelte:fragment slot="header">Invite Chat Draft Bot</svelte:fragment>
					{#if data.botInChannel}
						<iconify-icon
							icon="foundation:check"
							width="24"
							height="24"
							style="color: green"
							inline
						/>
						Bot successfully joined your channel!
						<br />
						<p>
							Recommendation: Provide chat draft bot with VIP status - type <code class="code"
								>/vip chatdraftbot</code
							> into your Twitch chat. VIP status allows the bot to function with follower/subscriber
							only mode enabled.
						</p>
						<br />
						Click ‘Next’ to set up your browser source(s).
					{:else}
						<p>
							The chat draft bot needs to be added to your Twitch channel. Click ‘Join Channel’ to
							invite the bot.
						</p>

						<form
							method="POST"
							action="/settings?/join"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type == 'success') {
										toastStore.trigger({ message: 'Bot successfully joined your channel.' });
									}
									update();
								};
							}}
						>
							<button class="btn btn-lg variant-filled-primary">Join Channel</button>
						</form>
					{/if}
				</Step>
				<Step>
					<svelte:fragment slot="header">Browser Source Set Up</svelte:fragment>
					<nav class="list-nav">
						<BrowserSources
							user={data.user}
							previewMode={data.previewMode}
							{full_source_configured}
							{deck_sources_configured}
							{choices_sources_configured}
						/>
					</nav>
				</Step>
				<Step>
					<svelte:fragment slot="header">Setup Complete!</svelte:fragment>
					<p>Congratulations! You have successfully configured Oro Chat Draft!</p>
					<br />
					<p>Click ‘Finish’ to complete Getting Started.</p>
				</Step>
			</Stepper>
		</form>
	</div>
{/if}
