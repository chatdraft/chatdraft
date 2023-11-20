<script lang="ts">
	import type { Card } from '$lib/snap/draft';

	export let cards: Card[];
    export let contentAlign: "start" | "center" = "start";
	export let perRow: 2 | 3 | 4 | 6 = 6;
</script>

<div class="grid-cols-{perRow} content-{contentAlign} grid">
	{#each Array(12/perRow) as _, i}
		{#each Array(perRow) as _, j}
				{#if cards[i*perRow+j]}
					<img src={cards[i*perRow+j].displayImageUrl} alt="{cards[i*perRow+j].name}'s card" />
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
