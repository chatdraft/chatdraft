<script lang="ts">
	import { Step, Stepper } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
    
    export let data: PageData;

    let full_source_configured = false;
    let split_sources_configured = false;

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
        if (!data.user) {
            goto('/');
        }
        establishWebSocket();
    })

    function onComplete() {
        goto('/draft');
    }
</script>

<svelte:head>
	<title>oro's chat draft - Get Started</title>
	<meta name="description" content="Get Started with Oro Chat Draft and run a Marvel Snap Twitch Chat Draft" />
</svelte:head>

<div class="p-4">
    <h1 class="h1">Getting Started</h1>
    <br/>
    <Stepper buttonCompleteLabel="Start Drafting!" on:complete={onComplete}>
        <Step locked={data.user == undefined}>
            <svelte:fragment slot="header">
                Log in with Twitch
            </svelte:fragment>
            Thanks for logging in. Please continue to invite the chat draft bot to your Twitch channel.
        </Step>
        <Step locked={!data.botInChannel}>
            <svelte:fragment slot="header">
                Invite bot
            </svelte:fragment>
            {#if data.botInChannel}
                The bot has successfully joined your channel! Please continue to setup your browser sources.
            {:else}
                Next, invite the chat draft bot to your Twitch channel.
                <form method="POST" action="/settings?/join" use:enhance><button class="btn btn-lg variant-filled-primary m-4">Join channel</button></form>
            {/if}
        </Step>
        <Step>
            <svelte:fragment slot="header">
                Browser source set up
            </svelte:fragment>
            <nav class="list-nav">
                <p>
                    TODO: insert explanation of setting up browser sources and the choice between combined or separate sources
                    and screenshots showing the difference.
                </p>
                <br/>
                <BrowserSources user="{data.user}" previewMode={data.previewMode} {full_source_configured} {split_sources_configured}/>
            </nav>
        </Step>
        <Step>
            <svelte:fragment slot="header">
                Getting started - Setup complete!
            </svelte:fragment>
            You have finished setup and are ready to draft!
        </Step>
    </Stepper>
</div>