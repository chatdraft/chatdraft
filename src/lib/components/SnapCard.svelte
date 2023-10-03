<script lang="ts">
	import type { Card } from "$lib/snap/draft";

	export let card: Card
</script>

<div class="card p-4 m-4">
	<header class="card-header text-center"><b>{card.name}</b></header>
	<section><img src={card.displayImageUrl} alt="{card.name}'s card" /></section>
	<footer class="text-center">{@html card.description}</footer>
</div>
