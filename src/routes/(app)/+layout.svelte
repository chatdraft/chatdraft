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
			<div class="grid items-center grid-cols-2 w-screen font-snapa uppercase text-2xl bg-gradient-to-br from-primary-500 to-secondary-300 bg-clip-text text-transparent box-decoration-clone">
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
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2v6Zm1-8q.425 0 .713-.288T13 8q0-.425-.288-.712T12 7q-.425 0-.712.288T11 8q0 .425.288.713T12 9Zm0 13q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z"/></svg>
						<span class="mr-2">About</span>
					</a>
				</li>

				{#if user && user.initialSetupDone}
					<li>
						<a href="settings">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/></svg>
							<span class="mr-2">Settings</span>
						</a>
					</li>
					<li>
						<a href="draft">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M0 0h24v24H0z"/><path fill="currentColor" d="m10.348 3.169l-7.15 3.113a2 2 0 0 0-1.03 2.608l4.92 11.895a1.96 1.96 0 0 0 2.59 1.063l7.142-3.11a2.002 2.002 0 0 0 1.036-2.611l-4.92-11.894a1.96 1.96 0 0 0-2.588-1.064zM16 3a2 2 0 0 1 1.995 1.85L18 5v3.5a1 1 0 0 1-1.993.117L16 8.5V5h-1a1 1 0 0 1-.117-1.993L15 3h1zm3.08 2.61a1 1 0 0 1 1.31-.53c.257.108.505.21.769.314a2 2 0 0 1 1.114 2.479l-.056.146l-2.298 5.374a1 1 0 0 1-1.878-.676l.04-.11l2.296-5.371l-.366-.148l-.402-.167a1 1 0 0 1-.53-1.312z"/></g></svg>
							<span class="mr-2">Draft</span>
						</a>
					</li>
				{:else}
					<li>
						<a href="start">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M477.64 38.26a4.75 4.75 0 0 0-3.55-3.66c-58.57-14.32-193.9 36.71-267.22 110a317 317 0 0 0-35.63 42.1c-22.61-2-45.22-.33-64.49 8.07C52.38 218.7 36.55 281.14 32.14 308a9.64 9.64 0 0 0 10.55 11.2l87.31-9.63a194.1 194.1 0 0 0 1.19 19.7a19.53 19.53 0 0 0 5.7 12L170.7 375a19.59 19.59 0 0 0 12 5.7a193.53 193.53 0 0 0 19.59 1.19l-9.58 87.2a9.65 9.65 0 0 0 11.2 10.55c26.81-4.3 89.36-20.13 113.15-74.5c8.4-19.27 10.12-41.77 8.18-64.27a317.66 317.66 0 0 0 42.21-35.64C441 232.05 491.74 99.74 477.64 38.26ZM294.07 217.93a48 48 0 1 1 67.86 0a47.95 47.95 0 0 1-67.86 0Z"/><path fill="currentColor" d="M168.4 399.43c-5.48 5.49-14.27 7.63-24.85 9.46c-23.77 4.05-44.76-16.49-40.49-40.52c1.63-9.11 6.45-21.88 9.45-24.88a4.37 4.37 0 0 0-3.65-7.45a60 60 0 0 0-35.13 17.12C50.22 376.69 48 464 48 464s87.36-2.22 110.87-25.75A59.69 59.69 0 0 0 176 403.09c.37-4.18-4.72-6.67-7.6-3.66Z"/></svg>
							<span class="mr-2">Get Started</span>
						</a>
					</li>
				{/if}

				{#if user && user.name == 'chatdraftbot'}
					<li>
						<button on:click={InviteBot}>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9c-2-2-5-2.4-7.4-1.3L9 6L6 9L1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4Z"/></svg>
							<span class="mr-2">Setup Chatbot</span>
						</button>
					</li>
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
