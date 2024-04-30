<script lang="ts">
	import type { Card } from '$lib/snap/draft';

	export let card: Card;
	export let hideName: boolean = false;
	export let hideDescription: boolean = false;
</script>

<div class="h-full">
	{#if !hideName || card === undefined || card.displayImageUrl == ''}
		<header class="card-header text-center"><b>{card.name}</b></header>
	{/if}
	<section>
		{#if card.displayImageUrl}
			<img src={card.displayImageUrl} alt="{card.name}'s card" {...$$restProps} />
		{/if}
	</section>
	{#if !hideDescription}
		<footer class="text-center pb-4">{@html card.description}</footer>
	{/if}
</div>
