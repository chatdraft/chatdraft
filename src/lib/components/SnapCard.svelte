<script lang="ts">
	import type { Card } from '$lib/snap/draft';

	export let card: Card;
	export let hideText: boolean = false;
</script>

<div class="card h-full">
	{#if !hideText}
		<header class="card-header text-center"><b>{card.name}</b></header>
	{/if}
	<section><img src={card.displayImageUrl} alt="{card.name}'s card" /></section>
	{#if !hideText}
		<footer class="text-center pb-4">{@html card.description}</footer>
	{/if}
</div>
