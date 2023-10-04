<script lang="ts">
	import type { Card } from '$lib/snap/draft';

	export let cards: Card[];
    export let contentAlign: "start" | "center" = "start";
</script>

<div class="flex flex-row flex-wrap flex-shrink content-{contentAlign}">
	{#each Array(12) as _, i}
		<section class="basis-1/6 w-1/6 flex-initial max-h-min">
			{#if cards[i]}
				<img src={cards[i].displayImageUrl} alt="{cards[i].name}'s card" />
			{:else}
				<img
					class="pt-4 pb-6 px-8"
					src="https://assets.snap.fan/files/assets/card-frame-placeholder.ef8c62230e9519b4.webp"
					alt="Placeholder card"
				/>
			{/if}
		</section>
	{/each}
</div>
