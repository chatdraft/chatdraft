<script lang="ts">
	import type { Card } from '$lib/snap/draft';

	export let cards: Card[];
	export let cols: 2 | 3 | 4 | 6 = 6;
</script>

<div class="flex flex-row content-start">
	{#each Array(cols) as _, i}
		<section class="basis-1/{cols} w-1/{cols} flex-initial max-h-min">
			{#each Array(12/cols) as _, j}
					{#if cards[j*cols+i]}
						<img src={cards[j*cols+i].displayImageUrl} alt="{cards[j*cols+i].name}'s card" />
					{:else}
						<img
							class="pt-4 pb-6 px-8 flex-none"
							src="/Placeholder.webp"
							alt="Placeholder card"
						/>
					{/if}
			{/each}
		</section>
	{/each}
</div>
