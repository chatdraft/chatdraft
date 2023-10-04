<script lang="ts">
	import type { Card } from '$lib/snap/draft';

	export let cards: Card[];
</script>

<div class="grid grid-cols-6 p-4">
	{#each Array(12) as _, i}
		<section>
			{#if cards[i]}
				<img src={cards[i].displayImageUrl} alt="{cards[i].name}'s card" />
			{:else}
				<img
					class="pt-2 pb-6 px-8"
					src="https://assets.snap.fan/files/assets/card-frame-placeholder.ef8c62230e9519b4.webp"
					alt="Placeholder card"
				/>
			{/if}
		</section>
	{/each}
</div>
