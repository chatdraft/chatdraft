<script lang="ts">
	import { Step, Stepper, clipboard } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
	import { twitch_login_uri } from '$lib/api/twitch/client';
	import { goto, invalidateAll } from '$app/navigation';
	import BrowserSources from '$lib/components/BrowserSources.svelte';
    
    export let data: PageData;

    function onComplete() {
        goto('/draft');
    }

	async function InviteBot() {
		const ret = await fetch(`/api/v1/bot/invite`, {method: 'POST'});
		invalidateAll();
	}
</script>

<svelte:head>
	<title>oro's chat draft - Setup</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

<div class="m-4">
    <Stepper buttonCompleteLabel="Start Drafting!" on:complete={onComplete}>
        <Step locked={data.user == undefined}>
            <svelte:fragment slot="header">
                Getting started - Log in with Twitch
            </svelte:fragment>
            {#if data.user == undefined}
                Welcome to Oro Chat Draft. Please start by <a class="anchor" href="{twitch_login_uri}">logging in with Twitch</a> and returning to this page.
                Add explanation of the channel points permissions requested and screenshot of the Twitch auth page
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
            {:else}
                Next, invite the bot to your channel. The bot will reconnect to your
                channel automatically.
                <button type="button" class="btn btn-lg variant-filled-primary" on:click={InviteBot}>Invite Bot</button>
            {/if}
        </Step>
        <Step>
            <svelte:fragment slot="header">
                Getting started - Set up browser sources
            </svelte:fragment>
            <nav class="list-nav">
                insert explanation of setting up browser sources and the choice between combined or separate sources
                <br/><br/><br/>
                <BrowserSources url_base="{data.url_base}" user="{data.user || ''}"/>
            </nav>
        </Step>
    </Stepper>
</div>