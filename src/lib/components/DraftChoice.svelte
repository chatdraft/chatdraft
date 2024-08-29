<script lang="ts">
	import type { Card } from '$lib/snap/cards';
	import { popup } from '@skeletonlabs/skeleton';

	export let choice: Card;
	export let selecting: boolean = false;
	export let selected: string | undefined = undefined;
</script>

<div>
	<button
		type="submit"
		name="selection"
		value={choice.cardDefKey}
		disabled={selecting}
		class:!outline={selecting && choice.cardDefKey === selected}
		class="[&>*]:pointer-events-none rounded-md btn p-0 hover:variant-soft-secondary"
		use:popup={{
			event: 'hover',
			target: `popupHover${choice.cardDefKey}`,
			placement: 'top'
		}}
		on:click
		{...$$restProps}
	>
		<img src={choice.displayImageUrl} alt="{choice.name}'s card" />
	</button>
	<p class="text-center text-xs">
		{@html choice.description}
	</p>
	<div
		class="card p-4 variant-filled-secondary duration-0"
		data-popup={`popupHover${choice.cardDefKey}`}
	>
		<b>{choice.name}</b>
		<div class="arrow variant-filled-secondary" />
	</div>
</div>
