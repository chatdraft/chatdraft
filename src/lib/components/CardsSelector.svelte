<script lang="ts">
	import { InputChip, Autocomplete, type AutocompleteOption } from '@skeletonlabs/skeleton';

	export let placeholder: string;
	export let cards: {
		cardDefKey: string;
		variantKey: null;
		url: string;
		name: string;
		description: string;
		displayImageUrl: string;
		cost: number;
	}[];

	let inputChip = '';

	export let selectedCards: string[] = [];

	const cardOptions: AutocompleteOption<string>[] = cards.map((card) => {
		return { label: card.name, value: card.cardDefKey };
	});

	function onInputChipSelect(event: CustomEvent<AutocompleteOption<string>>): void {
		console.log('onInputChipSelect', event.detail);
		if (selectedCards.includes(event.detail.value) === false) {
			selectedCards = [...selectedCards, event.detail.value];
			inputChip = '';
		}
	}
</script>

<div class="card w-full max-w-md max-h-60 overflow-y-auto" tabindex="-1">
	<InputChip
		bind:input={inputChip}
		bind:value={selectedCards}
		name="cards"
		whitelist={cardOptions.map((option) => option.value)}
		class="sticky top-0 m-4 w-auto"
		{placeholder}
	/>
	<Autocomplete
		bind:input={inputChip}
		options={cardOptions}
		denylist={selectedCards}
		on:selection={onInputChipSelect}
	/>
</div>
