<script lang="ts">
	import type { Card } from '$lib/snap/draft';

	export let card: Card;
	export let hideText: boolean = false;
</script>

<div class="h-full">
	{#if !hideText || !(card.displayImageUrl)}
		<header class="card-header text-center"><b>{card.name}</b></header>
	{/if}
	<section>
		{#if card.displayImageUrl}
			<img src={card.displayImageUrl} alt="{card.name}'s card" {...$$restProps} />
		{/if}
	</section>
	{#if !hideText}
		<footer class="text-center pb-4">{@html card.description}</footer>
	{/if}
</div>
