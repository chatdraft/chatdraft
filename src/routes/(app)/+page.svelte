<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Oro Chat Draft - Home</title>
	<meta name="description"
		content="Oro Chat Draft is a fun app for letting Twitch Chat draft a Marvel Snap Deck for a streamer to play." />
	<meta name="robots" content="follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large"/>
</svelte:head>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1 px-4 font-snapa uppercase text-6xl bg-gradient-to-br from-primary-500 to-secondary-300 bg-clip-text text-transparent box-decoration-clone">Oro Chat Draft</h1>
		<p>(Coming Soon!)</p>
		{#if data.user_unauthorized}
			<p>Thanks for your interest! Participation is currently available only to invited users. Please check back soon!</p>
		{/if}
	</div>
</div>
