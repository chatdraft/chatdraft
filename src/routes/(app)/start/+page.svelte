<script lang="ts">
	import { Step, Stepper, getToastStore } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import SnapFanApiInput from '$lib/components/SnapFanApiInput.svelte';
	import { establishWebSocket } from '$lib/websocket';

    const toastStore = getToastStore();

    export let data: PageData;

    let full_source_configured = false;
    let split_sources_configured = false;

    let skipSnapFan = false;
    let snapFanApiKey = '';

	let ws: WebSocket | null = null;

	const handleMessage = async(message: string) => {
		if (message.startsWith('browserupdated')) {
            const obj = JSON.parse(message.substring('browserupdated:'.length));
            full_source_configured = obj.full_source_configured;
            split_sources_configured = obj.split_sources_configured;
        }
	}

    onMount(async () => {
        if (!data.user) {
            goto('/');
        }
        ws = await establishWebSocket(handleMessage);
    })

    let setupForm: HTMLFormElement;

    async function onComplete() {
        const res = await fetch(setupForm.action, {method: setupForm.method, body: new FormData(setupForm)});
        if (res.ok) {
            goto('/draft');
        }
    }
</script>

<svelte:head>
	<title>oro's chat draft - Get Started</title>
	<meta name="description" content="Get Started with Oro Chat Draft and run a Marvel Snap Twitch Chat Draft" />
</svelte:head>

{#if data.user}
    <div class="p-4">
        <h1 class="h1">Getting Started</h1>
        <br/>
        <form method="POST" action="?/completeSetup" bind:this={setupForm}>
            <Stepper buttonCompleteLabel="Finish Set Up" on:complete={onComplete}>
                <Step locked={data.user == undefined}>
                    <svelte:fragment slot="header">
                        Oro Chat Draft Log In by Twitch Authentication
                    </svelte:fragment>
                    <p>
                        Successfully authenticated with Twitch and logged into Oro Chat Draft!
                    </p>
                    <br/>
                    <p>
                        Click ‘Next’ to invite the chat draft bot to your Twitch channel.
                    </p>
                </Step>
                <Step locked={!data.botInChannel}>
                    <svelte:fragment slot="header">
                        Invite Chat Draft Bot
                    </svelte:fragment>
                    {#if data.botInChannel}
                        ✅ Bot successfully joined your channel!
                        <br/>
                        <p>
                            Recommendation: Provide chat draft bot with VIP status 
                            - type <code class="code">/vip chatdraftbot</code> into 
                            your Twitch chat. VIP status allows bot to function 
                            with follower/subscriber only mode enabled.
                        </p>
                        <br/>
                        Click ‘Next’ to set up your browser source(s).
                    {:else}
                    <p>
                        The chat draft bot needs to be added to your Twitch 
                        channel. Click the link “Join Channel” button to invite 
                        the bot.
                    </p>
                    
                        <form method="POST" action="/settings?/join" use:enhance={()=> {
                            return async ({result, update}) => {
                                if (result.type == "success") {
                                    toastStore.trigger({message:"✅ Bot successfully joined your channel."});
                                }
                                update();
                            }
                        }}><button class="btn btn-lg variant-filled-primary m-4">Join channel</button></form>
                    {/if}
                </Step>
                <Step>
                    <svelte:fragment slot="header">
                        Browser Source Set Up
                    </svelte:fragment>
                    <nav class="list-nav">
                        <BrowserSources user={data.user} previewMode={data.previewMode} {full_source_configured} {split_sources_configured}/>
                    </nav>
                </Step>
                <Step>
                    <svelte:fragment slot="header">
                        Setup complete!
                    </svelte:fragment>
                    <p>
                        Congratulations! You have successfully configured Oro Chat Draft!
                    </p>
                    <br/>
                    <p>
                        Click ‘Finish Setup’ to complete Getting Started.
                    </p>
                </Step>
            </Stepper>
        </form>
    </div>
{/if}