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
                    <iconify-icon icon="clarity:copy-to-clipboard-line" width="32" height="32" flip="horizontal"></iconify-icon>
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
                    <iconify-icon icon="clarity:copy-to-clipboard-line" width="32" height="32" flip="horizontal"></iconify-icon>
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
                    <iconify-icon icon="clarity:copy-to-clipboard-line" width="32" height="32" flip="horizontal"></iconify-icon>
                </button>
            </div>
        </li>
    {/if}
</ul>