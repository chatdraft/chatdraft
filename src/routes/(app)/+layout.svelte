<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { twitch_login_uri, twitch_bot_uri } from '$lib/api/twitch/client';
	import '../../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { AppBar, AppShell, Avatar, storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

    export let data;
    $: user = data.user;

	async function logout() {
		await fetch('/api/v1/logout', {method: 'POST' });
		await invalidateAll();
		goto('/');
	}

	async function login() {
		window.location.href = twitch_login_uri;
	}

	async function InviteBot() {
		window.location.href = twitch_bot_uri;
	}
</script>

<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4" slotFooter="bg-surface-700 text-center">
	<svelte:fragment slot="header">
		<AppBar>
			<div class="grid items-center grid-cols-2 w-screen font-snapa uppercase text-2xl">
				<div>
					Oro Chat Draft
				</div>

				<div class="place-self-end pr-8">
					{#if user}
						<Avatar src={user.profile_picture_url}></Avatar>
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
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 21V9l8-6l8 6v12h-6v-7h-4v7H4Z"/></svg>
						<span class="mr-2">Home</span>
					</a>
				</li>
				<li>
					<a href="about">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M140 180a12 12 0 1 1-12-12a12 12 0 0 1 12 12ZM128 72c-22.06 0-40 16.15-40 36v4a8 8 0 0 0 16 0v-4c0-11 10.77-20 24-20s24 9 24 20s-10.77 20-24 20a8 8 0 0 0-8 8v8a8 8 0 0 0 16 0v-.72c18.24-3.35 32-17.9 32-35.28c0-19.85-17.94-36-40-36Zm104 56A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104Zm-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88Z"/></svg>
						<span class="mr-2">About</span>
					</a>
				</li>
				<li>
					<a href="setup">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/></svg>
						<span class="mr-2">Setup</span>
					</a>
				</li>

				{#if user}
					<li>
						<a href="draft">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M0 0h24v24H0z"/><path fill="currentColor" d="m10.348 3.169l-7.15 3.113a2 2 0 0 0-1.03 2.608l4.92 11.895a1.96 1.96 0 0 0 2.59 1.063l7.142-3.11a2.002 2.002 0 0 0 1.036-2.611l-4.92-11.894a1.96 1.96 0 0 0-2.588-1.064zM16 3a2 2 0 0 1 1.995 1.85L18 5v3.5a1 1 0 0 1-1.993.117L16 8.5V5h-1a1 1 0 0 1-.117-1.993L15 3h1zm3.08 2.61a1 1 0 0 1 1.31-.53c.257.108.505.21.769.314a2 2 0 0 1 1.114 2.479l-.056.146l-2.298 5.374a1 1 0 0 1-1.878-.676l.04-.11l2.296-5.371l-.366-.148l-.402-.167a1 1 0 0 1-.53-1.312z"/></g></svg>
							<span class="mr-2">Draft</span>
						</a>
					</li>
					{#if user.name == 'chatdraftbot'}
						<li>
							<button on:click={InviteBot}>
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9c-2-2-5-2.4-7.4-1.3L9 6L6 9L1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4Z"/></svg>
								<span class="mr-2">Setup Chatbot</span>
							</button>
						</li>
					{/if}
				{/if}
				<li>
					{#if !user}
						<button on:click={login}>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21v-2h7V5h-7V3h7q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21h-7Zm-2-4l-1.375-1.45l2.55-2.55H3v-2h8.175l-2.55-2.55L10 7l5 5l-5 5Z"/></svg>
							<span class="mr-2">Log in</span>
						</button>
					{:else}
						<button on:click={logout}>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2H5Zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5l-5 5Z"/></svg>
							<span class="mr-2">Logout</span>
						</button>
					{/if}
				</li>
				<li>
					{@html `<a href="https://www.buymeacoffee.com/oro.lol" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee"></a>`}
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
