<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import StreamList from '$lib/components/StreamList.svelte';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { title } from '$lib/title';
	import { onMount } from 'svelte';

	export let data;

	const toastStore = getToastStore();

	onMount(() => {
		if ($page.url.searchParams.get('timedout')) {
			toastStore.trigger({
				message: 'You have been logged out after 60 minutes of inactivity.',
				autohide: false,
				background: 'variant-filled-warning'
			});
			invalidate('chatdraft:auth');
		}
	});

	title.set('Oro Chat Draft - Home');
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

<div class="md:container">
	<div class="m-4">
		<h1 class="h1">Home</h1>
		<p class="mt-4">
			Welcome to Oro Chat Draft, an app so that Twitch chat can draft a Marvel Snap deck for a
			streamer to play!
		</p>
		{#if data.user_unauthorized}
			<p class="p-4">
				Thanks for your interest! Streamer participation is currently available only to invited
				users. Please contact
				<a href="https://twitch.tv/jjrolk" class="anchor">jjrolk</a>!
			</p>
		{/if}
		{#if data.activeDrafts}
			<h2 class="h2 pt-2">Active Chat Drafts</h2>
			<StreamList activeDrafts={data.activeDrafts} />
		{/if}
	</div>
</div>
