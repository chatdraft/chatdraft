<script lang="ts">
	import type { Card } from '$lib/snap/draft';

	export let cards: Card[];
	export let cols: 2 | 3 | 4 | 6 = 6;
</script>

<div class="grid grid-cols-{cols} content-start">
	{#each Array(12/cols) as _, i}
		{#each Array(cols) as _, j}
				{#if cards[i*cols+j]}
					<img src={cards[i*cols+j].displayImageUrl} alt="{cards[i*cols+j].name}'s card" />
				{:else}
					<img
						class="pt-4 pb-6 px-8 flex-none"
						src="https://assets.snap.fan/files/assets/card-frame-placeholder.ef8c62230e9519b4.webp"
						alt="Placeholder card"
					/>
				{/if}
		{/each}
	{/each}
</div>
