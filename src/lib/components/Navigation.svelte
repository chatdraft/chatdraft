<script lang="ts">
	import { page } from "$app/stores";
	import { twitch_bot_uri, twitch_login_uri } from "$lib/api/twitch/client";
	import { AppRail, AppRailAnchor } from "@skeletonlabs/skeleton";
	import { env } from '$env/dynamic/public';
	import AppRailIcon from "./AppRailIcon.svelte";

    export let user: {
        id: string | null;
        display_name: string | null;
        profile_picture_url: string | null;
        name: string;
        initialSetupDone: boolean;
        admin: boolean;
    } | null;

</script>


<AppRail class="text-center overflow-x-hidden h-full">
    <AppRailAnchor href="/">
        <AppRailIcon pageRouteId={$page.route.id} routeId='/(app)' icon='material-symbols:home'>
            Home
        </AppRailIcon>
    </AppRailAnchor>
    <AppRailAnchor href="/about">
        <AppRailIcon pageRouteId={$page.route.id} routeId='/about' icon='material-symbols:info-outline'>
            About
        </AppRailIcon>
    </AppRailAnchor>

    <AppRailAnchor href="/solodraft" class="hidden">
        <AppRailIcon pageRouteId={$page.route.id} routeId='/solodraft' icon='mdi:cards-outline'>
            Solo Draft
        </AppRailIcon>
    </AppRailAnchor>

    {#if user}
        {#if user.initialSetupDone}
            <AppRailAnchor href="/settings">
                <AppRailIcon pageRouteId={$page.route.id} routeId='/settings' icon='mdi:gear'>
                    Settings
                </AppRailIcon>
            </AppRailAnchor>
            <AppRailAnchor href="/draft">
                <AppRailIcon pageRouteId={$page.route.id} routeId='/draft' icon='mdi:cards'>
                    Draft
                </AppRailIcon>
            </AppRailAnchor>
        {:else}
            <AppRailAnchor href="/start">
                <AppRailIcon pageRouteId={$page.route.id} routeId='/start' icon='ion:rocket-sharp'>
                    Get Started
                </AppRailIcon>
            </AppRailAnchor>
        {/if}
    {/if}

    {#if user && user.admin}
    <AppRailAnchor href="/admin">
        <AppRailIcon pageRouteId={$page.route.id} routeId='/admin' icon='mdi:administrator'>
            Admin
        </AppRailIcon>
    </AppRailAnchor>
    {/if}

    {#if user && user.id == env.PUBLIC_TWITCH_USER_ID}
        <AppRailAnchor href={twitch_bot_uri}>
            <iconify-icon icon="mdi:wrench" width="28" height="28"></iconify-icon>
            <span class="mr-2 w-full">Setup Chatbot</span>
        </AppRailAnchor>
    {/if}
    {#if !user}
        <AppRailAnchor href={twitch_login_uri}>
            <iconify-icon icon="ri:twitch-fill" width="24" height="24"></iconify-icon>
            <p class="mr-2 w-full">Log in</p>
        </AppRailAnchor>
    {:else}
        <AppRailAnchor href="/logout" data-sveltekit-preload-data="tap" data-sveltekit-reload>
            <iconify-icon icon="material-symbols:logout" width="28" height="28"></iconify-icon>
            <p class="mr-2 w-full">Logout</p>
        </AppRailAnchor>
    {/if}
    <svelte:fragment slot="trail">
        
    </svelte:fragment>
</AppRail>