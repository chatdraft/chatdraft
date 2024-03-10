<script lang="ts">
	import { invalidate, onNavigate } from '$app/navigation';
	import { twitch_login_uri, twitch_bot_uri } from '$lib/api/twitch/client';
	import { env } from '$env/dynamic/public';
	import '../../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { AppBar, AppRail, AppRailAnchor, AppShell, Avatar, storePopup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

    export let data;
    $: user = data.user;

	onNavigate(async () => {
		invalidate('chatdraft:auth');
	});
</script>

<svelte:head>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
</svelte:head>


<a href="https://www.buymeacoffee.com/oro.lol" target="_blank" class="absolute bottom-6 right-2 w-36"><img class="p-2" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee">
	<iconify-icon icon="fluent:window-new-16-filled" width="24" height="24" class="absolute top-2 -right-1"></iconify-icon>
</a>
<AppShell slotSidebarLeft="bg-surface-500/5 text-center" slotFooter="bg-surface-700 text-center">
	<svelte:fragment slot="header">
		<AppBar gridColumns="grid-cols-2" slotDefault="place-self-start" slotTrail="place-content-end">
				<div class="font-snapa uppercase text-4xl bg-gradient-to-br from-primary-500 to-secondary-300 bg-clip-text text-transparent box-decoration-clone px-2">
					Oro Chat Draft
				</div>
			
			<svelte:fragment slot="trail">
				{#if user}
					<Avatar width="w-12" src={user.profile_picture_url}></Avatar>
				{:else}
					<a class="btn btn-md variant-outline-primary" href={twitch_login_uri}>Log in <iconify-icon icon="ri:twitch-fill" width="24" height="24" class="p-1"></iconify-icon></a>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<AppRail class="text-center overflow-x-hidden">
			<AppRailAnchor href="/">
					<iconify-icon icon="material-symbols:home" width="28" height="28"></iconify-icon>
					<p class="mr-2 w-full" class:underline={$page.route.id && $page.route.id == '/(app)'}>Home</p>
			</AppRailAnchor>
			<AppRailAnchor href="about">
				<iconify-icon icon="material-symbols:info-outline" width="28" height="28"></iconify-icon>
				<p class="mr-2 w-full" class:underline={$page.route.id && $page.route.id.includes('about')}>About</p>
			</AppRailAnchor>

			{#if user}
				{#if user.initialSetupDone}
					<AppRailAnchor href="settings">
						<iconify-icon icon="mdi:gear" width="28" height="28"></iconify-icon>
						<p class="mr-2 w-full" class:underline={$page.route.id && $page.route.id.includes('settings')}>Settings</p>
					</AppRailAnchor>
					<AppRailAnchor href="draft">
						<iconify-icon icon="mdi:cards" width="28" height="28"></iconify-icon>
						<p class="mr-2 w-full" class:underline={$page.route.id && $page.route.id.includes('draft')}>Draft</p>
					</AppRailAnchor>
				{:else}
					<AppRailAnchor href="start">
						<iconify-icon icon="ion:rocket-sharp" width="28" height="28"></iconify-icon>
						<p class="mr-2 w-full" class:underline={$page.route.id && $page.route.id.includes('start')}>Get Started</p>
					</AppRailAnchor>
				{/if}
			{/if}

			{#if user && user.admin}
			<AppRailAnchor href="admin">
				<iconify-icon icon="mdi:administrator" width="28" height="28"></iconify-icon>
				<p class="mr-2 w-full" class:underline={$page.route.id && $page.route.id.includes('admin')}>Admin</p>
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
				<AppRailAnchor href="logout" data-sveltekit-preload-data="tap" data-sveltekit-reload>
					<iconify-icon icon="material-symbols:logout" width="28" height="28"></iconify-icon>
					<p class="mr-2 w-full">Logout</p>
				</AppRailAnchor>
			{/if}
			<svelte:fragment slot="trail">
				
			</svelte:fragment>
		</AppRail>
	</svelte:fragment>
	
	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->
	<!-- Router Slot -->
	<div  class="mb-16">
		<slot/>
	</div>
	<!-- ---- / ---- -->
	<svelte:fragment slot="footer">
		©2023 oro version {__APP_VERSION__}
	</svelte:fragment>
	<!-- (footer) -->
</AppShell>
