<script lang="ts">
	import type IDraft from "$lib/snap/draft";
    import { shuffle } from "$lib/snap/utils";

    export let activeDrafts: {
        channel: string
        thumbnailUrl: string
        draft: IDraft | {total: number}
    }[]
</script>

<div class="m-4 max-h-max">
    {activeDrafts.length} drafts currently active.
    <div class="grid grid-cols-3 w-max h-screen overflow-y-auto">
        {#each activeDrafts as draft}
            <div class="group">
                <div class="relative group card m-2">
                    <a href="https://www.twitch.tv/{draft.channel}" target="_blank" class="anchor">
                        <img src="{draft.thumbnailUrl.replace("{width}", "320").replace("{height}", "180")}" alt="{draft.channel}'s stream" class="p-2">
                        <iconify-icon icon="fluent:window-new-16-filled" width="24" height="24" class="absolute top-2 -right-1 invisible group-hover:visible group-focus:visible"/>
                        <div class="absolute top-4 left-4 font-bold text-2xl font-outline shadow-black text-white font-snapa uppercase">{draft.channel}</div>
                        <div class="absolute bottom-2 right-4 font-bold text-xl font-outline shadow-black text-white font-snapa uppercase">Round: <span class="font-snapn text-2xl">{draft.draft.total}</span></div>
                    </a>
                </div>
            </div>
        {/each}
    </div>
</div>