<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
	import { onMount } from 'svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;

    let full_source_configured = data.full_source_configured;
    let split_sources_configured = data.split_sources_configured;

	let webSocketEstablished = false;
	let ws: WebSocket | null = null;

    const establishWebSocket = async () => {
		if (webSocketEstablished) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
		heartbeat();
		ws.onmessage = async (event) => {
			console.log('[websocket] message received', event);
			await handleMessage(event.data)
		};

		ws.onclose = async () => { 
			webSocketEstablished = false;
			ws = null;
			setTimeout(establishWebSocket, 5000);
		};

		webSocketEstablished = true;

		return ws;
	};

	function heartbeat() {
		setTimeout(heartbeat, 500);
		if (!ws) return;
		if (ws.readyState !== 1) return;
		ws.send("ping");
	}

	const handleMessage = async(message: string) => {
		if (message.startsWith('browserupdated')) {
            const obj = JSON.parse(message.substring('browserupdated:'.length));
            full_source_configured = obj.full_source_configured;
            split_sources_configured = obj.split_sources_configured;
        }
	}

    onMount(() => {
        establishWebSocket();
    })
</script>


<svelte:head>
	<title>oro's chat draft - Settings</title>
	<meta name="description" content="Oro Chat Draft Settings" />
</svelte:head>

<div class="p-4">
    <h1 class="h1">Settings</h1>
    <br/>
    
    <h2 class="h2">ChatDraftBot</h2>
    {#if data.botInChannel}
        <p class="m-2">
            Have ChatDraftBot leave your channel. Note that you will be unable to use Chat Draft without the bot in your channel.
        </p>
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

    <h2 class="h2">Browser Sources</h2>
    <BrowserSources user="{data.user || ''}" previewMode={data.previewMode} {full_source_configured} {split_sources_configured}/>
</div>