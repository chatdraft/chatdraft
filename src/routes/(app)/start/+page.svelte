<script lang="ts">
	import { Step, Stepper } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
	import { twitch_login_uri } from '$lib/api/twitch/client';
	import { goto } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
	import { enhance } from '$app/forms';
    
    export let data: PageData;

    function onComplete() {
        goto('/draft');
    }
</script>

<svelte:head>
	<title>oro's chat draft - Get Started</title>
	<meta name="description" content="Get Started with Oro Chat Draft and run a Marvel Snap Twitch Chat Draft" />
</svelte:head>

{#if data.user == undefined}
    <div class="p-4">
        <h1>Welcome to <span class="font-snapa uppercase bg-gradient-to-br from-primary-500 to-secondary-300 bg-clip-text text-transparent box-decoration-clone px-1">Oro Chat Draft</span>!</h1>
        Please start by <a class="anchor" href="{twitch_login_uri}">logging in with Twitch</a> and returning to this page.
        TODO: Add explanation of the channel points permissions requested and screenshot of the Twitch auth page
    </div>
{:else}
    <div class="p-4">
        <Stepper buttonCompleteLabel="Start Drafting!" on:complete={onComplete}>
            <Step locked={data.user == undefined}>
                <svelte:fragment slot="header">
                    Getting started - Log in with Twitch
                </svelte:fragment>
                Thanks for logging in. You can continue to the next step.
            </Step>
            <Step locked={!data.botInChannel}>
                <svelte:fragment slot="header">
                    Getting started - Invite bot
                </svelte:fragment>
                {#if data.botInChannel}
                    The bot has successfully joined your channel! Please continue to setup your browser sources.
                {:else}
                    Next, invite the bot to your channel.
                    <form method="POST" action="/settings?/join" use:enhance><button class="btn btn-lg variant-filled-primary m-4">Join channel</button></form>
                {/if}
            </Step>
            <Step>
                <svelte:fragment slot="header">
                    Getting started - Set up browser sources
                </svelte:fragment>
                <nav class="list-nav">
                    TODO: insert explanation of setting up browser sources and the choice between combined or separate sources
                    <br/><br/><br/>
                    <BrowserSources url_base="{data.url_base}" user="{data.user}"/>
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
{/if}