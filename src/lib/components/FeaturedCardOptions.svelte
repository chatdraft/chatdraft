<script lang="ts">
	import { type FeaturedCardMode } from '$lib/featuredCard';
	import { LookupCard } from '$lib/snap/cards';
	import type { CardDb } from '$lib/snap/cards';
	import { RadioGroup, RadioItem, popup, Autocomplete } from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, PopupSettings } from '@skeletonlabs/skeleton';

	export let cardPool: CardDb;

	export let featuredCardSelect: 'seasonpass' | 'spotlight' | 'custom' | undefined = undefined;
	export let featuredCardMode: FeaturedCardMode = 'off';
	export let customFeaturedCardName: string = '';
	export let customFeaturedCardDefKey: string = '';
	export let collection: string[] | null = null;
	const customFeaturedCardOptions: AutocompleteOption<string>[] | undefined = cardPool?.all
		.filter((card) => !collection || collection.includes(card.cardDefKey))
		.map((card) => {
			return { label: card.name, value: card.cardDefKey };
		});

	export let customFeaturedCardValidationMessage = '';

	const customFeaturedCardPopupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'right'
	};

	function onCustomFeaturedCardSelection(event: CustomEvent<AutocompleteOption<string>>): void {
		customFeaturedCardDefKey = event.detail.value;
		customFeaturedCardName = event.detail.label;
		customFeaturedCardValidationMessage = '';
	}
</script>

<span class="font-bold inline-block place-items-center">Featured Card Mode:</span>
<br />
<RadioGroup
	name="featuredCardMode"
	active="variant-filled-primary"
	hover="hover:variant-soft-primary"
>
	<RadioItem bind:group={featuredCardMode} name="featuredCardMode" value="off">Off</RadioItem>
	<RadioItem bind:group={featuredCardMode} name="featuredCardMode" value="on">On</RadioItem>
	<RadioItem bind:group={featuredCardMode} name="featuredCardMode" value="full">Full</RadioItem>
</RadioGroup>
<br />
<span>
	{#if featuredCardMode == 'off'}
		No featured card will be used.
	{:else if featuredCardMode == 'on'}
		The featured card will be one of the choices during the first round of the draft.
	{:else if featuredCardMode == 'full'}
		The featured card will be every choice during the first round of the draft
	{/if}
</span>
{#if featuredCardMode != 'off'}
	<br />
	<span class="font-bold inline-block place-items-center">Featured Card:</span>
	<select class="select" bind:value={featuredCardSelect} name="featuredCardSelect">
		<option
			value="seasonpass"
			disabled={collection && !collection.includes(cardPool.currentSeasonPassCardDefId)}
		>
			Current Season Pass Card: {LookupCard(cardPool.all, cardPool.currentSeasonPassCardDefId).name}
			{#if collection && !collection.includes(cardPool.currentSeasonPassCardDefId)}
				(Unowned)
			{/if}
		</option>
		<option
			value="spotlight"
			disabled={collection && !collection.includes(cardPool.currentSpotlightCardDefId)}
		>
			Current Spotlight Card: {LookupCard(cardPool.all, cardPool.currentSpotlightCardDefId).name}
			{#if collection && !collection.includes(cardPool.currentSpotlightCardDefId)}
				(Unowned)
			{/if}
		</option>
		<option value="custom">Custom Card</option>
	</select>
	{#if featuredCardSelect == 'custom'}
		<br />
		<span class="font-bold inline-block place-items-center"> Custom Featured Card: </span>
		<input
			class="input"
			type="search"
			name="customFeaturedCard"
			bind:value={customFeaturedCardName}
			placeholder="Enter a card name..."
			use:popup={customFeaturedCardPopupSettings}
			on:input={() => {
				if (customFeaturedCardName != LookupCard(cardPool.all, customFeaturedCardDefKey).name) {
					customFeaturedCardDefKey = '';
				}
				const card = cardPool.all
					.filter((card) => !collection || collection.includes(card.cardDefKey))
					.find(
						(card) =>
							card.name.toLowerCase() == customFeaturedCardName.toLowerCase() ||
							card.cardDefKey.toLowerCase() == customFeaturedCardName.toLowerCase()
					);
				if (card) {
					customFeaturedCardDefKey = card.cardDefKey;
					customFeaturedCardValidationMessage = '';
				}
			}}
		/>
		{#if customFeaturedCardValidationMessage}
			<span class="text-error-500 font-bold">
				* {customFeaturedCardValidationMessage}
			</span>
		{/if}
		<div
			class="card w-full max-w-sm max-h-48 overflow-y-auto"
			tabindex="-1"
			data-popup="popupAutocomplete"
		>
			<Autocomplete
				bind:input={customFeaturedCardName}
				options={customFeaturedCardOptions}
				on:selection={onCustomFeaturedCardSelection}
			/>
		</div>
	{/if}
{/if}
<input
	type="hidden"
	name="featuredCardDefKey"
	value={featuredCardSelect === 'seasonpass'
		? cardPool.currentSeasonPassCardDefId
		: featuredCardSelect == 'spotlight'
		? cardPool.currentSpotlightCardDefId
		: featuredCardSelect == 'custom'
		? customFeaturedCardDefKey
		: ''}
/>
