<script lang="ts">
	import { invalidate, onNavigate } from '$app/navigation';
	import { twitch_login_uri, twitch_bot_uri } from '$lib/api/twitch/client';
	import { env } from '$env/dynamic/public';
	import '../../app.postcss';
	import { Drawer, Toast, getDrawerStore, initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
	const drawerStore = getDrawerStore();

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { AppBar, AppRail, AppRailAnchor, AppShell, Avatar, storePopup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import AppRailIcon from '$lib/components/AppRailIcon.svelte';
	import { onMount, setContext } from 'svelte';
	import { sessionTimout_ms } from '$lib/constants';
	import Navigation from '$lib/components/Navigation.svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

    export let data;
    $: user = data.user;

	let timeoutTimer: NodeJS.Timeout

	onMount(() => {
		StartIdleTimer();
	})

	async function StartIdleTimer() {
		if (data.user) {
			timeoutTimer = setTimeout(IdleTimeout, sessionTimout_ms + 500)
		}
	}

	async function IdleTimeout() {
		invalidate('chatdraft:auth');
		window.location.href = "/?timedout=true";
	}

	async function ResetTimeout() {
		clearTimeout(timeoutTimer);
		StartIdleTimer();
	}

	setContext('ResetTimer', {ResetTimeout})

	onNavigate(async () => {
		invalidate('chatdraft:auth');
		ResetTimeout();
	});

	function drawerOpen() {
		drawerStore.open();
	}
</script>

<svelte:head>
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
</svelte:head>


<a href="https://www.buymeacoffee.com/oro.lol" target="_blank" class="absolute bottom-6 right-2 w-48 xl:w-64 anchor group z-50">
	<img class="p-2" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee">
	<iconify-icon icon="fluent:window-new-16-filled" width="24" height="24" class="absolute top-1.5 right-1.5 invisible group-hover:visible group-focus:visible"></iconify-icon>
</a>
<Toast position="t" />
<Drawer width="w-20">
	<Navigation {user} />
</Drawer>
<AppShell slotSidebarLeft="bg-surface-500/5 text-center" slotFooter="bg-surface-700 text-center">
	<svelte:fragment slot="header">
		<AppBar gridColumns="grid-cols-2" slotDefault="place-self-start" slotTrail="place-content-end">
			<div class="flex items-center">
				<button class="md:hidden btn btn-sm mr-4" on:click={drawerOpen}>
					<span>
						<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
							<rect width="100" height="20" />
							<rect y="30" width="100" height="20" />
							<rect y="60" width="100" height="20" />
						</svg>
					</span>
				</button>
				<div class="font-snapa uppercase text-2xl md:text-4xl bg-gradient-to-br from-primary-500 to-secondary-300 bg-clip-text text-transparent box-decoration-clone px-2 flex-initial w-auto flex-shrink-0">
					Oro Chat Draft
				</div>
			</div>
			
			<svelte:fragment slot="trail">
				{#if user}
					<Avatar width="w-12" src={ user.profile_picture_url || '' }></Avatar>
				{:else}
					<a class="btn btn-md variant-outline-primary" href={twitch_login_uri}>Log in <iconify-icon icon="ri:twitch-fill" width="24" height="24" class="p-1"></iconify-icon></a>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<div id="sidebar-left" class="hidden md:block h-full">
			<Navigation {user} />
		</div>
	</svelte:fragment>
	
	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->
	<!-- Router Slot -->
	<div class="mb-16">
		<slot/>
	</div>
	<!-- ---- / ---- -->
	<svelte:fragment slot="footer">
		©2023 oro version {__APP_VERSION__}
	</svelte:fragment>
	<!-- (footer) -->
</AppShell>
