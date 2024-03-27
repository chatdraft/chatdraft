<script lang='ts'>
    import { clipboard } from "@skeletonlabs/skeleton";

    export let url: string;
    export let layerName: string;
    export let height: number;
    export let width: number;

</script>
<div class="flex">
    <div class="p-4">
        <h3 class="h3">Quick Setup (OBS only)</h3>
        <p>Simply drag and drop this button into OBS.</p>
        <a class="btn btn-sm variant-filled-secondary browser-drag-item cursor-move w-min m-2" data-sveltekit-preload-data="false" on:click|preventDefault 
            draggable="true" 
            href={`${url}${url.includes('?') ? '&' : '?'}layer-name=${layerName}&layer-height=${height}&layer-width=${width}`}>
                Drag and drop to OBS
                <iconify-icon icon="clarity:drag-handle-line" width="36" height="36"></iconify-icon>
        </a>
    </div>
    <div class="grid grid-flow-row grid-rows-3">
        <span class="divider-vertical"/>
        <div class="place-content-center">
            Or
        </div>
        <span class="divider-vertical"/>
    </div>
    <div class="p-4">
        <h3 class="h3">Manual Setup</h3>
        <p>
            <slot />
        </p>
        <div class="flex mb-4 p-2">
            <span class="font-bold pt-6">Browser Source URL:</span>
            <div data-clipboard="OptionsAndDeckView" class="m-4 whitespace-nowrap border p-2 w-104">
                {url}
            </div>
            <button class="btn-icon btn-icon-md variant-filled-secondary h-min place-self-center" use:clipboard={{ element: 'OptionsAndDeckView' }}>
                <iconify-icon icon="clarity:copy-to-clipboard-line" width="24" height="24" flip="horizontal"></iconify-icon>
            </button>
        </div>
    </div>
</div>