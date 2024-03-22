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
            <Stepper buttonCompleteLabel="Start Drafting!" on:complete={onComplete}>
                <Step locked={data.user == undefined}>
                    <svelte:fragment slot="header">
                        Twitch Log In
                    </svelte:fragment>
                    Thanks for logging in. Please continue to invite the chat draft bot to your Twitch channel.
                </Step>
                <Step locked={!data.botInChannel}>
                    <svelte:fragment slot="header">
                        Invite bot
                    </svelte:fragment>
                    {#if data.botInChannel}
                        The bot has successfully joined your channel!
                        It is recommended that you give the bot VIP status
                        in your channel so it will still work in follower/subscriber
                        only mode. You can do this by typing <code class="code">/vip chatdraftbot</code> command into
                        your Twitch chat channel or by visiting the
                        <a class="anchor" href="https://dashboard.twitch.tv/u/{data.user}/community/roles" target="_blank">
                            Twitch Community Manager
                            <iconify-icon icon="fluent:window-new-16-filled" width="16" height="16" />
                        </a>.
                         Please continue to setup your browser sources.
                    {:else}
                        The chat draft bot needs to be added to your channel to interact with your viewers. Invite the chat draft bot to your Twitch channel. 
                        <form method="POST" action="/settings?/join" use:enhance={()=> {
                            return async ({result, update}) => {
                                if (result.type == "success") {
                                    toastStore.trigger({message:"Bot successfully joined your channel."});
                                }
                                update();
                            }
                        }}><button class="btn btn-lg variant-filled-primary m-4">Join channel</button></form>
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
                        <BrowserSources user={data.user} previewMode={data.previewMode} {full_source_configured} {split_sources_configured}/>
                    </nav>
                </Step>
                <Step locked={!skipSnapFan && snapFanApiKey.length == 0}>
                    <svelte:fragment slot="header">
                        Collection set up
                    </svelte:fragment>
                    <SnapFanApiInput bind:skipSnapFan bind:snapFanApiKey />
                </Step>
                <Step>
                    <svelte:fragment slot="header">
                        Setup complete!
                    </svelte:fragment>
                    You have finished setup and are ready to draft!
                </Step>
            </Stepper>
        </form>
    </div>
{/if}