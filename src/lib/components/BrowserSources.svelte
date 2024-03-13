<script lang="ts">
	import { enhance } from "$app/forms";
    import { page } from "$app/stores";
	import { SlideToggle, Tab, TabGroup, clipboard } from "@skeletonlabs/skeleton";

    export let user: string | undefined;
    export let previewMode: boolean = false;
    export let full_source_configured: boolean = false;
    export let split_sources_configured: boolean = false;
    let togglePreviewSaveBtn: HTMLButtonElement;

    let tabSet: number = 0;
</script>

<TabGroup>
    <Tab bind:group={tabSet} name="combinedTab" value={0}>
        <span>Combined</span>
    </Tab>
    <Tab bind:group={tabSet} name="splitTab" value={1}>
        <span>Split</span>
    </Tab>
    <svelte:fragment slot="panel">
        <div class="card p-2">
            {#if tabSet === 0}
                <div class="flex">
                    <div class="w-1/2">
                        <h3 class="h3">Quick Setup (OBS only)</h3>
                        <p>Simply drag and drop this button into OBS.</p>
                        <a class="btn btn-sm variant-filled-secondary browser-drag-item cursor-move w-min m-2" on:click|preventDefault draggable="true" href="{`${$page.url.origin}/stream/${user}?layer-name=Oro%20Chat%20Draft&layer-height=1080&layer-width=640`}">
                            Drag and drop to OBS
                            <iconify-icon icon="clarity:drag-handle-line" width="36" height="36"></iconify-icon>
                        </a>
                    </div>
                    <div class="min-h-fit w-[1px] mx-4 bg-surface-600"/>
                    <div class="w-1/2">
                        <h3 class="h3">Manual Setup</h3>
                        <p>TODO: insert Screenshot of Options & Deck and recommended browser resolution</p>
                        <div class="flex mb-4 p-2">
                            <div data-clipboard="OptionsAndDeckView" class="m-4 whitespace-nowrap border p-2">
                                {`${$page.url.origin}/stream/${user}`}
                            </div>
                            <button class="btn-icon btn-icon-md variant-filled-secondary h-min place-self-center" use:clipboard={{ element: 'OptionsAndDeckView' }}>
                                <iconify-icon icon="clarity:copy-to-clipboard-line" width="24" height="24" flip="horizontal"></iconify-icon>
                            </button>
                        </div>
                    </div>
                </div>
                <hr class="m-4"/>
                <p class="text-center">
                    {#if full_source_configured}
                        Browser source connection detected
                        <iconify-icon icon="foundation:check" width="24" height="24" inline></iconify-icon>
                    {:else}
                        Waiting for browser source connection
                        <iconify-icon icon="line-md:loading-twotone-loop" width="24" height="24" inline></iconify-icon>
                    {/if}
                </p>
            {:else if tabSet === 1}
                <div class="flex">
                    <div class="w-1/2">
                        <h3 class="h3">Quick Setup (OBS only)</h3>
                        <p>Simply drag and drop both of these buttons into OBS.</p>
                        <a class="btn btn-sm variant-filled-secondary browser-drag-item cursor-move w-min m-2" on:click|preventDefault draggable="true" href="{`${$page.url.origin}/stream/${user}?hide=deck&layer-name=Oro%20Chat%20Draft%20Choices&layer-height=410&layer-width=500`}">
                            Choices - Drag and drop to OBS
                            <iconify-icon icon="clarity:drag-handle-line" width="36" height="36"></iconify-icon>
                        </a>
                        <a class="btn btn-sm variant-filled-secondary browser-drag-item cursor-move w-min m-2" on:click|preventDefault draggable="true" href="{`${$page.url.origin}/stream/${user}?hide=choice&layer-name=Oro%20Chat%20Draft%20Deck&layer-height=445&layer-width=500`}">
                            Deck - Drag and drop to OBS
                            <iconify-icon icon="clarity:drag-handle-line" width="36" height="36"></iconify-icon>
                        </a>
                    </div>
                    <div class="min-h-fit w-[1px] mx-4 bg-surface-600"/>
                    <div class="w-1/2">
                        <h3 class="h3">Manual Setup</h3>
                        TODO: insert Screenshot of Options only and recommended browser resolution
                        <div class="flex mb-4 p-2">
                            <div data-clipboard="OptionsView" class="m-4 whitespace-nowrap border p-2">
                                {`${$page.url.origin}/stream/${user}?hide=deck`}
                            </div>
                            <button class="btn-icon btn-icon-md variant-filled-secondary h-min place-self-center" use:clipboard={{ element: 'OptionsView' }}>
                                <iconify-icon icon="clarity:copy-to-clipboard-line" width="32" height="32" flip="horizontal"></iconify-icon>
                            </button>
                        </div>
                        TODO: insert Screenshot of Deck only and recommended browser resolution
                        <div class="flex mb-4 p-2">
                            <div data-clipboard="DeckView" class="m-4 whitespace-nowrap border p-2">
                                {`${$page.url.origin}/stream/${user}?hide=choice`}
                            </div>
                            <button class="btn-icon btn-icon-md variant-filled-secondary h-min place-self-center" use:clipboard={{ element: 'DeckView' }}>
                                <iconify-icon icon="clarity:copy-to-clipboard-line" width="32" height="32" flip="horizontal"></iconify-icon>
                            </button>
                        </div>
                    </div>
                </div>
                <hr class="m-4"/>
                <p class="text-center">
                    {#if split_sources_configured}
                        Browser sources connection detected
                        <iconify-icon icon="foundation:check" width="24" height="24" inline></iconify-icon>
                    {:else}
                        Waiting for browser sources connection
                        <iconify-icon icon="line-md:loading-twotone-loop" width="24" height="24" inline></iconify-icon>
                    {/if}
                </p>
            {/if}
            <hr class="m-4"/>
            <h3 class="h3">Preview Mode</h3>
            <p class="m-2">
                When an draft isn't active, the browser sources will be completely transparent.
                Preview mode fills the browser sources with an example draft that you can use
                to adjust them to your stream layout without starting a real draft.
                Once a real draft is started, preview mode will be automatically disabled.
            </p>
            <form method="post" use:enhance action="?/togglePreview" class="m-2">
                <SlideToggle name="previewmode" bind:checked={previewMode} on:change={() => togglePreviewSaveBtn.click()} active="bg-primary-500">
                    Preview Mode
                </SlideToggle>
                <button bind:this={togglePreviewSaveBtn} class="hidden collapse">
                    Submit
                </button>
            </form>
        </div>
    </svelte:fragment>
</TabGroup>