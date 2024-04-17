<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { FileDropzone } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
	import { getToastStore } from '@skeletonlabs/skeleton';

    const toastStore = getToastStore();
    
    export let data: PageData;
    $: drafts = data.drafts;
    $: previousDrafts = data.previousDrafts;
    $: channels = data.channels!;
    $: authorizedUsers = data.authorizedUsers!;
    $: adminUsers = data.adminUsers!;
	$: setupCompleteUsers = data.setupCompleteUsers;

    let files: FileList;

	export let form;
</script>

<svelte:head>
	<title>Oro Chat Draft - Admin</title>
	<meta name="description"
		content="Oro Chat Draft is a fun app for letting Twitch Chat draft a Marvel Snap Deck for a streamer to play." />
	<meta name="robots" content="follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large"/>
</svelte:head>


<section class="p-4">
    <h1 class="h1">Admin</h1>
    <br/>
    <button class="btn-icon btn-icon-sm variant-filled-primary" on:click={() => invalidateAll()}><iconify-icon icon="material-symbols:refresh"></iconify-icon></button> Refresh
    <br/>
    <hr class="m-4">
    <form method="POST" action="?/updatecards" enctype="multipart/form-data" use:enhance={()=> {
        return async ({result, update}) => {
            if (result.type == "success") {
                toastStore.trigger({message:"Card database successfully updated."});
            }
            update();
        }
    }}>
        <h3 class="h3">Update card database</h3>
        <FileDropzone name="files" bind:files class="m-4 w-1/3" multiple={false} accept=".json" required>
            <svelte:fragment slot="message">
                {#if files && files.length > 0}
                    {files[0].name} selected.
                {:else}
                    Please select an updated cards.json file
                {/if}
            </svelte:fragment>
        </FileDropzone>
        <button class="btn btn-md variant-filled-primary m-4" type="submit">Submit</button>
        {#if form?.updated}
            Successfully updated card database.
        {/if}
    </form>
    <a class="anchor" href="api/v1/cards" target="#">
        Check current card database
        <iconify-icon icon="fluent:window-new-16-filled" width="16" height="16"></iconify-icon>
    </a>
    <form method="POST" action="?/resetcards" use:enhance={({cancel}) => {
        if (!confirm("Are you sure you want to reset the card database to installed default?")) {
            cancel();
        }
        
        return async ({result, update}) => {
            if (result.type == "success") {
                toastStore.trigger({message:"Card database successfully reset to build settings."});
            }
            update();
        }
    }}>
        <button class="btn btn-md variant-outline-warning m-4" type="submit">Reset to default card database</button>
        {#if form?.reset}
            Successfully reset card database.
        {/if}
    </form>
    <hr class="m-4">
    <section>Admin Accounts:</section>
    <ul class="list-disc list-inside">
        {#each adminUsers as username}
            <li>{username}</li>
        {/each}
    </ul>
    <br/>
    <hr class="m-4">
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
    <hr class="m-4">
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
	<hr class="m-4">
	<section>Getting started complete for:</section>
	<ul class="list-disc list-inside">
		{#if setupCompleteUsers}
			{#each setupCompleteUsers as user}
			<form method="POST" action="?/resetsetup" use:enhance>
				<li>
					<button class="btn-icon btn-icon-sm variant-outline-error">
						<iconify-icon icon="mdi:remove-bold"></iconify-icon>
					</button>
					{user}
					<input type="hidden" id="username" name="username" value="{user}">
				</li>
			</form>
			{/each}
		{/if}
	</ul>
    <hr class="m-4">

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
    <hr class="m-4">
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
    <hr class="m-4">
</section>