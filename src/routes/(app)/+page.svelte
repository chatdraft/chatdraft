<script lang="ts">
	export let data;
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1 font-snapa uppercase text-6xl bg-gradient-to-br from-primary-500 to-secondary-300 bg-clip-text text-transparent box-decoration-clone">Oro Chat Draft</h1>
		<p>(Coming Soon!)</p>
		{#if data.user_unauthorized}
			<p>Thanks for your interest! Participation is currently available only to invited users. Please check back soon!</p>
		{/if}
	</div>
</div>
