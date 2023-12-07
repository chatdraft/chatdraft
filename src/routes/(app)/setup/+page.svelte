<script lang="ts">
	import { Step, Stepper, clipboard } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
	import { twitch_login_uri } from '$lib/api/twitch/client';
	import { goto, invalidateAll } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
    
    export let data: PageData;

    function onComplete() {
        goto('/draft');
    }



	let initialSetupDone = false;

    onMount(() => {
        initialSetupDone = data.botInChannel;
    });
</script>

<svelte:head>
	<title>oro's chat draft - Setup</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

{#if !initialSetupDone}
    <div class="p-4">
        <Stepper buttonCompleteLabel="Start Drafting!" on:complete={onComplete}>
            <Step locked={data.user == undefined}>
                <svelte:fragment slot="header">
                    Getting started - Log in with Twitch
                </svelte:fragment>
                {#if data.user == undefined}
                    Welcome to Oro Chat Draft. Please start by <a class="anchor" href="{twitch_login_uri}">logging in with Twitch</a> and returning to this page.
                    TODO: Add explanation of the channel points permissions requested and screenshot of the Twitch auth page
                {:else}
                    Thanks for logging in. You can continue to the next step.
                {/if}
            </Step>
            <Step locked={!data.botInChannel}>
                <svelte:fragment slot="header">
                    Getting started - Invite bot
                </svelte:fragment>
                {#if data.botInChannel}
                    The bot has successfully joined your channel. Please continue to setup your browser sources.
                    <br /><br />
                    If you no longer wish to use the Chat Draft, you can have the bot
                    leave your channel.
                    <br/>
                    <form method="POST" action="?/part" use:enhance><button class="btn btn-lg variant-filled-warning m-4">Leave channel</button></form>
                {:else}
                    Next, invite the bot to your channel.
                    <form method="POST" action="?/join" use:enhance><button class="btn btn-lg variant-filled-primary m-4">Join channel</button></form>
                {/if}
            </Step>
            <Step>
                <svelte:fragment slot="header">
                    Getting started - Set up browser sources
                </svelte:fragment>
                <nav class="list-nav">
                    TODO: insert explanation of setting up browser sources and the choice between combined or separate sources
                    <br/><br/><br/>
                    <BrowserSources url_base="{data.url_base}" user="{data.user || ''}"/>
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
{:else}
    <div class="p-4">
        <h1>Setup</h1>
        <br/>
        
        <h2>ChatDraftBot</h2>
        Have ChatDraftBot leave your channel:
        <form method="POST" action="?/part" use:enhance on:submit={() => {initialSetupDone = false;}}><button class="btn btn-lg variant-filled-warning m-4">Leave channel</button></form>
        <br/>
        
        <h2>Browser Sources</h2>
        <BrowserSources url_base="{data.url_base}" user="{data.user || ''}"/>
    </div>
{/if}