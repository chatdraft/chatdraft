<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { ParseCollectionState } from '$lib/snap/cards';
	import { clipboard, getToastStore } from '@skeletonlabs/skeleton';
	import { tick } from 'svelte';

	const toastStore = getToastStore();

	const gameStateFile =
		'c:\\Users\\%USERNAME%\\AppData\\LocalLow\\Second Dinner\\SNAP\\Standalone\\States\\nvprod\\CollectionState.json';
	export let collectionComplete: boolean;
	let collectionFile: HTMLInputElement;
	let collectionFiles: FileList | null;
	let cards: string[] | undefined = undefined;

	let uploading: boolean = false;

	function Submit(e: Event) {
		if (!collectionFile.files || collectionFile.files.length < 1) {
			e.preventDefault();
		}
	}

	async function collectionFileChanged() {
		collectionFiles = collectionFile.files;
		if (
			collectionFiles &&
			collectionFiles.length > 0 &&
			collectionFiles[0].name === 'CollectionState.json'
		) {
			try {
				cards = []; // A validation error flashes momentarily if we don't set this
				const collectionData = JSON.parse(await collectionFiles[0].text());
				if (collectionData) {
					cards = await ParseCollectionState(collectionData);
				}
			} catch (e) {
				cards = undefined;
			}
		}
	}

	async function ChangeFile() {
		collectionFiles = null;
		cards = undefined;
		await tick(); // After one tick, the collection file picker control will reactivate
		collectionFile.showPicker();
	}
</script>

<form method="post" action="?/resetCollection" id="resetForm" use:enhance />
<form
	method="post"
	action="?/uploadCollection"
	enctype="multipart/form-data"
	use:enhance={async () => {
		uploading = true;
		return async ({ result, update }) => {
			uploading = false;
			collectionFiles = null;
			cards = undefined;
			if (result.type == 'success') {
				toastStore.trigger({ message: 'Collection state updated successfully.' });
			}
			await update();
		};
	}}
>
	Click this button to copy the default path on Windows for Marvel Snap's Collection state file:
	<button
		class="btn btn-icon variant-filled-primary"
		on:click|preventDefault
		use:clipboard={gameStateFile}
		title="Copy default Collection State.json path"
	>
		<iconify-icon icon="clarity:copy-to-clipboard-line" width="24" height="24" flip="horizontal" />
	</button>
	<br />
	<div>
		{#if !cards}
			<input
				bind:this={collectionFile}
				name="collection"
				class="mt-2 input w-1/3"
				type="file"
				accept=".json"
				on:change={collectionFileChanged}
				required
				title="Please select CollectionState.json to upload."
				placeholder="Select CollectionState.json"
			/>
			{#if collectionFiles && collectionFiles.length > 0}
				{#if collectionFiles[0].name != 'CollectionState.json'}
					<p class="text-error-500 pl-8">
						* Incorrect file chosen: <span class="italic">{collectionFiles[0].name}</span>. Please
						choose <span class="italic">CollectionState.json</span>
					</p>
				{:else}
					<p class="text-error-500 pl-8">
						* Unable to parse <span class="italic">CollectionState.json</span>. Please check the
						file and try again.
					</p>
				{/if}
			{/if}
		{:else}
			<button
				class="flex flex-row input w-1/3 h-min items-center p-1 space-x-2 mt-2 cursor-default"
				title="CollectionState.json selected"
				on:click={ChangeFile}
			>
				<button class="btn btn-sm variant-filled cursor-default" type="button" on:click={ChangeFile}
					>Change File</button
				>
				<div class="truncate">
					{collectionFiles ? collectionFiles[0].name : 'CollectionState.json'} chosen
				</div>
			</button>
			{#each cards as card}
				<input type="hidden" name="collectedCards" value={card} />
			{/each}
		{/if}
	</div>
	<button
		class="btn btn-md variant-filled-primary mt-2"
		on:click={Submit}
		disabled={uploading || (browser && (!cards || cards.length < 1))}
	>
		Upload Collection
	</button>
	{#if !collectionComplete}
		<button class="btn btn-md variant-outline-warning" type="submit" form="resetForm">
			Reset to Collection Complete
		</button>
	{/if}
</form>
