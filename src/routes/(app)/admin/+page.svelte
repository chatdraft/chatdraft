<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
    import type { PageData } from './$types';
    
    export let data: PageData;
    $: drafts = data.drafts;
    $: previousDrafts = data.previousDrafts;
    $: channels = data.channels;
    $: authorizedUsers = data.authorizedUsers;
    $: adminUsers = data.adminUsers;
</script>

<svelte:head>
	<title>Oro Chat Draft - Admin</title>
	<meta name="description"
		content="Oro Chat Draft is a fun app for letting Twitch Chat draft a Marvel Snap Deck for a streamer to play." />
	<meta name="robots" content="follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large"/>
</svelte:head>



<section class="p-4">
    <button class="btn-icon btn-icon-sm variant-filled-primary" on:click={() => invalidateAll()}><iconify-icon icon="material-symbols:refresh"></iconify-icon></button>
    <section>Admin Accounts:</section>
    <ul class="list-disc list-inside">
        {#each adminUsers as username}
            <li>{username}</li>
        {/each}
    </ul>
    <br/>
    <section>Authorized Accounts:</section>
    <ul class="list-disc list-inside">
        {#each authorizedUsers as username}
            <form method="POST" action="?/deauthorize" use:enhance>
                <li><button class="btn-icon btn-icon-sm variant-outline-error">
                    <iconify-icon icon="mdi:remove-bold"></iconify-icon>
                </button>  {username}</li>
                <input type="hidden" id="username" name="username" value="{username}">
            </form>
        {/each}
        <form method="POST" action="?/authorize" use:enhance>
            <label for="username">Authorize User:</label>
            <input type="text" id="username" name="username" placeholder="Username" class="text-black">
            <button class="btn-icon btn-icon-sm variant-outline-primary"><iconify-icon icon="mdi:check-bold"></iconify-icon></button>
        </form>
    </ul>
    <br/>
    <section>Chatbot is connected to:</section>
    <ul class="list-disc list-inside">
        {#each channels as channel}

            <form method="POST" action="?/partchannel" use:enhance>
                <li>
                    <button class="btn-icon btn-icon-sm variant-outline-error">
                        <iconify-icon icon="mdi:remove-bold"></iconify-icon>
                    </button>
                    {channel}
                    <input type="hidden" id="username" name="username" value="{channel}">
                </li>
            </form>
        {/each}
    </ul>
    <form method="POST" action="?/joinchannel" use:enhance>
        <label for="username">Join Channel:</label>
        <input type="text" id="username" name="username" placeholder="Username" class="text-black">
        <button class="btn-icon btn-icon-sm variant-outline-primary"><iconify-icon icon="mdi:check-bold"></iconify-icon></button>
    </form>
    <br/>

    <section>Number of Active Drafts: {drafts.length}</section>

    <ul class="list-disc list-inside">
        {#each drafts as draft}
            <li>
                Draft Player: {draft.player}
                <br/>
                Draft Duration: {draft.duration}
                <br/>
                Draft Round: {draft.total + 1}
            </li>
        {/each}
    </ul>

    <br/>
    <section>Number of Previous Drafts: {previousDrafts.length}</section>
    <ul class="list-disc list-inside">
        {#each previousDrafts as draft}
            <li>
                Draft Player: {draft.player}
                <br/>
                Draft Duration: {draft.duration}
                <br/>
                Draft Round: {draft.total + 1}
            </li>
        {/each}
    </ul>
</section>