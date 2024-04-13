<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
	import { onMount } from 'svelte';
    import type { ActionData, PageData } from './$types';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import SnapFanApiInput from '$lib/components/SnapFanApiInput.svelte';
	import { establishWebSocket } from '$lib/websocket';
	import DraftPreferences from '$lib/components/DraftPreferences.svelte';
	import CollectionState from '$lib/components/CollectionState.svelte';
	import SelectionCountSlider from '$lib/components/SelectionCountSlider.svelte';
	import DurationSlider from '$lib/components/DurationSlider.svelte';
	import ChatDraftSlideToggle from '$lib/components/ChatDraftSlideToggle.svelte';
	import BgOpacitySlider from '$lib/components/BgOpacitySlider.svelte';
    import { type WebSocketMessage, WebSocketMessageType } from '$lib/websocket';

    const toastStore = getToastStore();
    
    export let data: PageData;

    let full_source_configured = data.full_source_configured;
    let deck_sources_configured = data.deck_sources_configured;
    let choices_sources_configured = data.choice_sources_configured;

    let skipSnapFan = false;
    let snapFanApiKey = '';

	let webSocketEstablished = false;
	let ws: WebSocket | null = null;

	const handleMessage = async(message: string) => {
        const wsm : WebSocketMessage = JSON.parse(message);
		if (wsm.type == WebSocketMessageType.BrowserUpdated) {
            const obj = JSON.parse(wsm.message!);
            full_source_configured = obj.full_source_configured;
            deck_sources_configured = obj.deck_sources_configured;
            choices_sources_configured = obj.choice_sources_configured;
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
	<p class="mt-4">
		Oro Chat Draft user options and configurations.
	</p>
    <br/>
    <form method="POST" action="?/updatePreferences" use:enhance={()=> {
        return async ({result}) => {
            if (result.type == "success") {
                toastStore.trigger({message:"Settings updated successfully."});
            }
            //update();
        }
    }}>
        <h2 class="h2">
            Draft Defaults
        </h2>
        <p class="mt-4">
            Set your default preferences for starting a draft.
        </p>
        <div class="grid grid-cols-2">
            <DurationSlider duration={data.duration} />
        </div>
        <div class="grid grid-cols-2">
            <SelectionCountSlider selectionCount={data.selectionCount} />
        </div>
        <ChatDraftSlideToggle name="subsExtraVote" checked={data.subsExtraVote} active="bg-primary-500" label="Subscriber votes +1" />
        <button class="btn btn-lg variant-filled-primary mt-2">Save Defaults</button><br/>
    </form>
    <br/><br/>
    <h2 class="h2">Chat Draft Bot</h2>
    {#if data.botInChannel}
        <p class="mt-4">
            Have chat draft bot leave your channel.
        </p>
        <form method="POST" action="?/part" on:submit={invalidateAll} use:enhance={()=> {
            return async ({result, update}) => {
                if (result.type == "success") {
                    toastStore.trigger({message:"Bot successfully left your channel."});
                }
                update();
            }
        }}>
            <button class="btn btn-lg variant-filled-warning mt-2">Leave Channel</button>
        </form>
        <p class="mt-4">
            Note: Chat draft will not work without the bot in your channel.
        </p>
    {:else}
        <p class="mt-4">
            Have chat draft bot join your channel:
        </p>
        <form method="POST" action="?/join" on:submit={invalidateAll} use:enhance={()=> {
            return async ({result, update}) => {
                if (result.type == "success") {
                    toastStore.trigger({message:"Bot successfully joined your channel."});
                }
                update();
            }
        }}>
            <button class="btn btn-lg variant-filled-primary mt-2">Join Channel</button>
        </form>
    {/if}
    <br/>
    <br/>

    <h2 class="h2">Browser Sources</h2>
    <BrowserSources user={data.user || ''} previewMode={data.previewMode} {full_source_configured} {deck_sources_configured} {choices_sources_configured}/>
    <br/>

    <h2 class="h2">Snap Collection</h2>
    <form method="post" action="?/uploadCollection" enctype="multipart/form-data" use:enhance={()=> {
        return async ({result, update}) => {
            if (result.type == "success") {
                toastStore.trigger({message:"Collection state updated successfully."});
            }
            update();
        }
    }}>
        <CollectionState collectionComplete={data.collectionComplete}/>
    </form>
</div>