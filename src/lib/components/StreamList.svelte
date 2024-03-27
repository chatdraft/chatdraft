<script lang="ts">
	import { lazyLoad } from "$lib/lazyLoad";
	import type IDraft from "$lib/snap/draft";

    export let activeDrafts: {
        channel: string
        thumbnailUrl: string
        draft: IDraft | {total: number}
    }[]
</script>

<div class="max-h-max">
    <p class="mt-4">
        {activeDrafts.length} Live Twitch Channels Chat Drafting
    </p>
    <div class="md:grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 min-w-max h-screen">
        {#each activeDrafts as draft}
            <div class="group w-fit">
                <div class="relative group-hover:outline outline-1 outline-offset-4 outline-white card m-2">
                    <a href="https://www.twitch.tv/{draft.channel}" target="_blank" class="anchor w-full">
                        <img 
                            use:lazyLoad={draft.thumbnailUrl.replace("{width}", "320").replace("{height}", "180")} 
                            alt="{draft.channel}'s stream" class="p-2 opacity-0 transition-opacity duration-1000" height="180" width="320">
                        <iconify-icon icon="fluent:window-new-16-filled" width="24" height="24" class="absolute top-2 -right-1 invisible group-hover:visible group-focus:visible"/>
                        <p class="absolute top-4 left-4 font-bold text-4xl font-outline shadow-black text-white font-snapa uppercase truncate w-64 text-center backdrop-blur-md bg-white/30 rounded-md">{draft.channel}</p>
                        <div class="absolute bottom-2 right-4 font-bold text-4xl font-outline shadow-black text-white font-snapn uppercase backdrop-blur-md bg-white/30 text-center rounded-md px-2">Pick <span class="font-snapn text-4xl font-outline shadow-black">{draft.draft.total}</span></div>
                    </a>
                </div>
            </div>
        {/each}
    </div>
</div>