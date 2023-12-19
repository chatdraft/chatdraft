<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>


<svelte:head>
	<title>oro's chat draft - Settings</title>
	<meta name="description" content="Oro Chat Draft Settings" />
</svelte:head>

<div class="p-4">
    <h1>Setup</h1>
    <br/>
    
    <h2>ChatDraftBot</h2>
    {#if data.botInChannel}
        Have ChatDraftBot leave your channel. Note that you will be unable to use Chat Draft without the bot in your channel.
        <form method="POST" action="?/part" use:enhance on:submit={invalidateAll}>
            <button class="btn btn-lg variant-filled-warning m-4">Leave channel</button>
        </form>
    {:else}
        Have ChatDraftBot join your channel:
        <form method="POST" action="?/join" use:enhance on:submit={invalidateAll}>
            <button class="btn btn-lg variant-filled-primary m-4">Join channel</button>
        </form>
    {/if}
    <br/>

    <h2>Browser Sources</h2>
    <BrowserSources url_base="{data.url_base}" user="{data.user || ''}" previewMode={data.previewMode}/>
</div>