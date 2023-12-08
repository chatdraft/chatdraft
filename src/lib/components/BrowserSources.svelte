<script lang="ts">
	import { RadioGroup, RadioItem, clipboard } from "@skeletonlabs/skeleton";

    export let url_base: string;
    export let user: string;
    let splitView = false;
</script>


<RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
    <RadioItem bind:group={splitView} name="SourceView" value={false}>Combined</RadioItem>
    <RadioItem bind:group={splitView} name="SourceView" value={true}>Separate</RadioItem>
</RadioGroup>
<br/><br/>
<ul>
    {#if !splitView}
        <li>
            TODO: insert Screenshot of Options & Deck and recommended browser resolution
            <div class="flex mb-4 p-2">
                <div data-clipboard="OptionsAndDeckView" class="m-4 whitespace-nowrap border-2 p-2">
                    {`${url_base}/stream/${user}`}
                </div>
                <button class="btn btn-sm variant-filled-secondary" use:clipboard={{ element: 'OptionsAndDeckView' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8Zm-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"/></svg>
                </button>
            </div>
        </li>
    {:else}
        <li>
            TODO: insert Screenshot of Options only and recommended browser resolution
            <div class="flex mb-4 p-2">
                <div data-clipboard="OptionsView" class="m-4 whitespace-nowrap border-2 p-2">
                    {`${url_base}/stream/${user}?hide=deck`}
                </div>
                <button class="btn btn-sm variant-filled-secondary" use:clipboard={{ element: 'OptionsView' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8Zm-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"/></svg>
                </button>
            </div>
        </li>
        <li>
            TODO: insert Screenshot of Deck only and recommended browser resolution
            <div class="flex mb-4 p-2">
                <div data-clipboard="DeckView" class="m-4 whitespace-nowrap border-2 p-2">
                    {`${url_base}/stream/${user}?hide=choice`}
                </div>
                <button class="btn btn-sm variant-filled-secondary" use:clipboard={{ element: 'DeckView' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8Zm-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"/></svg>
                </button>
            </div>
        </li>
    {/if}
</ul>