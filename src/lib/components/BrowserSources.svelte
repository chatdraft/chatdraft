<script lang="ts">
	import { enhance } from "$app/forms";
	import { RadioGroup, RadioItem, clipboard } from "@skeletonlabs/skeleton";

    export let url_base: string;
    export let user: string;
    export let previewMode: boolean = false;
    let splitView = false;
</script>

<form method="post" use:enhance action="?/togglePreview">
        <button class="btn btn-sm m-4" class:variant-filled-primary={previewMode} class:variant-filled-warning={!previewMode}>
            {#if previewMode}
                Preview On
            {:else}
                Preview Off
            {/if}
        </button>
</form>
<br/><br/>
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
                <div data-clipboard="OptionsAndDeckView" class="m-4 whitespace-nowrap border p-2">
                    {`${url_base}/stream/${user}`}
                </div>
                <button class="btn-icon btn-icon-md variant-filled-secondary h-min place-self-center" use:clipboard={{ element: 'OptionsAndDeckView' }}>
                    <iconify-icon icon="clarity:copy-to-clipboard-line" width="24" height="24" flip="horizontal"></iconify-icon>
                </button>
            </div>
        </li>
    {:else}
        <li>
            TODO: insert Screenshot of Options only and recommended browser resolution
            <div class="flex mb-4 p-2">
                <div data-clipboard="OptionsView" class="m-4 whitespace-nowrap border p-2">
                    {`${url_base}/stream/${user}?hide=deck`}
                </div>
                <button class="btn-icon btn-icon-md variant-filled-secondary h-min place-self-center" use:clipboard={{ element: 'OptionsView' }}>
                    <iconify-icon icon="clarity:copy-to-clipboard-line" width="32" height="32" flip="horizontal"></iconify-icon>
                </button>
            </div>
        </li>
        <li>
            TODO: insert Screenshot of Deck only and recommended browser resolution
            <div class="flex mb-4 p-2">
                <div data-clipboard="DeckView" class="m-4 whitespace-nowrap border p-2">
                    {`${url_base}/stream/${user}?hide=choice`}
                </div>
                <button class="btn-icon btn-icon-md variant-filled-secondary h-min place-self-center" use:clipboard={{ element: 'DeckView' }}>
                    <iconify-icon icon="clarity:copy-to-clipboard-line" width="32" height="32" flip="horizontal"></iconify-icon>
                </button>
            </div>
        </li>
    {/if}
</ul>