<script lang="ts">
	import type { Card } from '$lib/snap/draft';

	export let cards: Card[];
    export let contentAlign: "start" | "center" = "start";
	export let perRow: 2 | 3 | 4 | 6 = 6;
</script>

<div class="flex flex-row flex-shrink content-{contentAlign}">
	{#each Array(perRow) as _, i}
		<section class="basis-1/{perRow} w-1/{perRow} flex-initial max-h-min">
			{#each Array(12/perRow) as _, j}
					{#if cards[j*perRow+i]}
						<img src={cards[j*perRow+i].displayImageUrl} alt="{cards[j*perRow+i].name}'s card" />
					{:else}
						<img
							class="pt-4 pb-6 px-8"
							src="https://assets.snap.fan/files/assets/card-frame-placeholder.ef8c62230e9519b4.webp"
							alt="Placeholder card"
						/>
					{/if}
			{/each}
		</section>
	{/each}
</div>
