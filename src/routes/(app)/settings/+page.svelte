<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
	import { onMount } from 'svelte';
    import type { PageData } from './$types';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import SnapFanApiInput from '$lib/components/SnapFanApiInput.svelte';
	import { establishWebSocket } from '$lib/websocket';
	import DraftPreferences from '$lib/components/DraftPreferences.svelte';
	import CollectionState from '$lib/components/CollectionState.svelte';

    const toastStore = getToastStore();
    
    export let data: PageData;

    let full_source_configured = data.full_source_configured;
    let split_sources_configured = data.split_sources_configured;

    let skipSnapFan = false;
    let snapFanApiKey = '';

	let webSocketEstablished = false;
	let ws: WebSocket | null = null;

	const handleMessage = async(message: string) => {
		if (message.startsWith('browserupdated')) {
            const obj = JSON.parse(message.substring('browserupdated:'.length));
            full_source_configured = obj.full_source_configured;
            split_sources_configured = obj.split_sources_configured;
        }
	}

    onMount(async () => {
        ws = await establishWebSocket(handleMessage);
    })
</script>


<svelte:head>
	<title>oro's chat draft - Settings</title>
	<meta name="description" content="Oro Chat Draft Settings" />
</svelte:head>

<div class="p-4">
    <h1 class="h1">Settings</h1>
    <br/>
    <form method="POST" action="?/updatePreferences" use:enhance={()=> {
        return async ({result}) => {
            if (result.type == "success") {
                toastStore.trigger({message:"Settings updated successfully."});
            }
            //update();
        }
    }}>
        <div class="card p-4 w-1/2">
            <DraftPreferences duration={data.duration} selectionCount={data.selectionCount} subsExtraVote={data.subsExtraVote} />
            <button class="btn btn-lg variant-filled-primary">Save Defaults</button><br/>
        </div>
    </form>
    <br/><br/>
    <h2 class="h2">Chat Draft Bot</h2>
    {#if data.botInChannel}
        <p class="m-2">
            Have Chat Draft Bot leave your channel. Note that you will be unable to use Chat Draft without the bot in your channel.
        </p>
        <form method="POST" action="?/part" on:submit={invalidateAll} use:enhance={()=> {
            return async ({result, update}) => {
                if (result.type == "success") {
                    toastStore.trigger({message:"Bot successfully left your channel."});
                }
                update();
            }
        }}>
            <button class="btn btn-lg variant-filled-warning m-4">Leave Channel</button>
        </form>
    {:else}
        Have Chat Draft Bot join your channel:
        <form method="POST" action="?/join" on:submit={invalidateAll} use:enhance={()=> {
            return async ({result, update}) => {
                if (result.type == "success") {
                    toastStore.trigger({message:"Bot successfully joined your channel."});
                }
                update();
            }
        }}>
            <button class="btn btn-lg variant-filled-primary m-4">Join Channel</button>
        </form>
    {/if}
    <br/>

    <h2 class="h2">Browser Sources</h2>
    <BrowserSources user="{data.user || ''}" previewMode={data.previewMode} {full_source_configured} {split_sources_configured}/>
    <br/>

    <h2 class="h2">Snap Collection</h2>
    <form method="post" action="?/uploadCollection" enctype="multipart/form-data" use:enhance={()=> {
        return async ({result}) => {
            if (result.type == "success") {
                toastStore.trigger({message:"Collection state updated successfully."});
            }
            //update();
        }
    }}>
        <CollectionState/>
    </form>
</div>