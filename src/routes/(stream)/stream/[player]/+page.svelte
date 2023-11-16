<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import SnapCard from '$lib/components/SnapCard.svelte';
	import SnapDeck from '$lib/components/SnapDeck.svelte';
	import { onMount } from 'svelte';

	export let data;

	$: current_draft = data.draft;
	$: choice1 = data.choice?.card1;
	$: choice2 = data.choice?.card2;
	$: choice3 = data.choice?.card3;
	$: votes1 = data.choice?.votes1!;
	$: votes2 = data.choice?.votes2!;
	$: votes3 = data.choice?.votes3!;

	onMount(() => {
		setInterval(() => {
			invalidateAll();
		}, 5000);
	});
</script>

<svelte:head>
	<title>oro's chat draft - Stream</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

{#if current_draft}
	{#if current_draft?.total < 12 }
		<div class="min-h-screen flex flex-col">
			<div class="flex flex-grow flex-wrap">
				{#if choice1 && choice2 && choice3}
					<div class="basis-1/3 text-center text-lg">{votes1} votes</div>
					<div class="basis-1/3 text-center text-lg">{votes2} votes</div>
					<div class="basis-1/3 text-center text-lg">{votes3} votes</div>
					<div class="basis-1/3"><SnapCard hideText={true} card={choice1} /></div>
					<div class="basis-1/3"><SnapCard hideText={true} card={choice2} /></div>
					<div class="basis-1/3"><SnapCard hideText={true} card={choice3} /></div>
					<div class="basis-1/3 text-center text-6xl">1</div>
					<div class="basis-1/3 text-center text-6xl">2</div>
					<div class="basis-1/3 text-center text-6xl">3</div>
				{/if}
			</div>
			<div class="flex flex-shrink">
				<div class="shrink basis-1/2"></div>
				<SnapDeck cards={current_draft?.cards || []} />
				<div class="shrink basis-1/2"></div>
			</div>
		</div>
	{:else}
		<div class="min-h-screen flex flex-row">
			<div class="flex flex-shrink flex-col">
				<span class="h1 my-20 text-center shrink basis-1/2"><br/>Draft Complete</span>
				<SnapDeck cards={current_draft?.cards || []} />
				<div class="shrink basis-1/2"></div>
			</div>
		</div>
	{/if}
{/if}