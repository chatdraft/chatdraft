<script lang="ts">
	import { shuffle } from "$lib/snap/utils";

    export let activeDrafts: {
        channel: string
        thumbnailUrl: string
    }[]
</script>

<div class="m-4 max-h-max">
    {activeDrafts.length} drafts currently active.
    <div class="grid grid-cols-3 w-max h-screen overflow-y-auto">
        {#each shuffle(activeDrafts) as draft}
                <div class="group">
                    <a href="https://www.twitch.tv/{draft.channel}" target="_blank" class="relative anchor group card">
                        <img src="{draft.thumbnailUrl.replace("{width}", "320").replace("{height}", "180")}" alt="{draft.channel}'s stream" class="p-2">
                        <iconify-icon icon="fluent:window-new-16-filled" width="24" height="24" class="absolute top-2 -right-1 invisible group-hover:visible group-focus:visible"/>
                        <div class="text-center">{draft.channel}</div>
                    </a>
                </div>
        {/each}
    </div>
</div>