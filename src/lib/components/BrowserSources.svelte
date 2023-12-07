<script lang="ts">
	import { clipboard } from "@skeletonlabs/skeleton";

    export let url_base: string;
    export let user: string;
</script>

<ul>
    <li>
        TODO: insert Screenshot of Options & Deck and recommended browser resolution
        <div class="flex mb-4 p-2">
            <div data-clipboard="OptionsAndDeckView" class="m-4 whitespace-nowrap border-2 p-2">
                {`${url_base}/stream/${user}`}
            </div>
            <button class="btn btn-sm variant-filled" use:clipboard={{ element: 'OptionsAndDeckView' }}>Copy</button>
        </div>
    </li>
    <li>
        TODO: insert Screenshot of Options only and recommended browser resolution
        <div class="flex mb-4 p-2">
            <div data-clipboard="OptionsView" class="m-4 whitespace-nowrap border-2 p-2">
                {`${url_base}/stream/${user}?hide=deck`}
            </div>
            <button class="btn btn-sm variant-filled" use:clipboard={{ element: 'OptionsView' }}>Copy</button>
        </div>
    </li>
    <li>
        TODO: insert Screenshot of Deck only and recommended browser resolution
        <div class="flex mb-4 p-2">
            <div data-clipboard="DeckView" class="m-4 whitespace-nowrap border-2 p-2">
                {`${url_base}/stream/${user}?hide=choice`}
            </div>
            <button class="btn btn-sm variant-filled" use:clipboard={{ element: 'DeckView' }}>Copy</button>
        </div>
    </li>
</ul>