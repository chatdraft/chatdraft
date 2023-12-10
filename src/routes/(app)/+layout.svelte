<script lang="ts">
	import { invalidate, onNavigate } from '$app/navigation';
	import { twitch_login_uri, twitch_bot_uri } from '$lib/api/twitch/client';
	import { env } from '$env/dynamic/public';
	import '../../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { AppBar, AppShell, Avatar, storePopup } from '@skeletonlabs/skeleton';
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

<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4" slotFooter="bg-surface-700 text-center">
	<svelte:fragment slot="header">
		<AppBar>
			<div class="grid items-center grid-cols-2 w-screen">
				<div class="font-snapa uppercase text-2xl bg-gradient-to-br from-primary-500 to-secondary-300 bg-clip-text text-transparent box-decoration-clone px-2">
					Oro Chat Draft
				</div>

				<div class="place-self-end pr-8">
					{#if user}
						<Avatar src={user.profile_picture_url}></Avatar>
					{:else}
						<a class="btn btn-md variant-outline-primary" href={twitch_login_uri}>Log in <iconify-icon icon="ri:twitch-fill" width="24" height="24" class="p-1"></iconify-icon></a>
					{/if}
				</div>
			</div>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<nav class="list-nav">
			<ul>
				<li>
					<a href="/">
						<iconify-icon icon="material-symbols:home" width="28" height="28"></iconify-icon>
						<span class="mr-2">Home</span>
					</a>
				</li>
				<li>
					<a href="about">
						<iconify-icon icon="material-symbols:info-outline" width="28" height="28"></iconify-icon>
						<span class="mr-2">About</span>
					</a>
				</li>

				{#if user && user.initialSetupDone}
					<li>
						<a href="settings">
							<iconify-icon icon="mdi:gear" width="28" height="28"></iconify-icon>
							<span class="mr-2">Settings</span>
						</a>
					</li>
					<li>
						<a href="draft">
							<iconify-icon icon="mdi:cards" width="28" height="28"></iconify-icon>
							<span class="mr-2">Draft</span>
						</a>
					</li>
				{:else}
					<li>
						<a href="start">
							<iconify-icon icon="ion:rocket-sharp" width="28" height="28"></iconify-icon>
							<span class="mr-2">Get Started</span>
						</a>
					</li>
				{/if}

				{#if user && user.id == env.PUBLIC_TWITCH_USER_ID}
					<li>
						<a href={twitch_bot_uri}>
							<iconify-icon icon="mdi:wrench" width="28" height="28"></iconify-icon>
							<span class="mr-2">Setup Chatbot</span>
						</a>
					</li>
				{/if}
				<li>
					{#if !user}
						<a href={twitch_login_uri}>
							<iconify-icon icon="material-symbols:login" width="28" height="28"></iconify-icon>
							<span class="mr-2">Log in</span><iconify-icon icon="ri:twitch-fill" width="24" height="24"></iconify-icon>
						</a>
					{:else}
						<a href="logout" data-sveltekit-preload-data="tap" data-sveltekit-reload>
							<iconify-icon icon="material-symbols:logout" width="28" height="28"></iconify-icon>
							<span class="mr-2">Logout</span>
						</a>
					{/if}
				</li>
				<li>
					<div>
						<a href="https://www.buymeacoffee.com/oro.lol" target="_blank" class="relative"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee">
							<iconify-icon icon="fluent:window-new-16-filled" width="24" height="24" class="absolute top-0 right-1"></iconify-icon>
						</a>
					</div>
				</li>
			</ul>
		</nav>
	</svelte:fragment>
	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->
	<!-- Router Slot -->
	<slot />
	<!-- ---- / ---- -->
	<svelte:fragment slot="footer">
		©2023 oro version {__APP_VERSION__}
	</svelte:fragment>
	<!-- (footer) -->
</AppShell>
