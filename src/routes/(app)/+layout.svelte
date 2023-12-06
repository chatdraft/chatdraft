<script lang="ts">
	import { invalidateAll } from '$app/navigation';
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
					<a href="/">Home</a>
				</li>
				<li>
					<a href="about">About</a>
				</li>

				{#if user}
					<li>
						<a href="draft">Draft</a>
					</li>
					<li>
						<a href="{`stream/${user.name}`}" target="_blank">Stream View <br/> Options & Deck</a>
					</li>
					<li>
						<a href="{`stream/${user.name}`}?hide=deck" target="_blank">Stream View <br/> Options only</a>
					</li>
					<li>
						<a href="{`stream/${user.name}`}?hide=choice" target="_blank">Stream View <br/> Deck only</a>
					</li>
					{#if user.name == 'chatdraftbot'}
						<li>
							<button on:click={InviteBot}>Setup Chatbot</button>
						</li>
					{/if}
				{/if}
				<li>
					{#if !user}
						<button on:click={login}>Log in</button>
					{:else}
						<button on:click={logout}>Logout</button>
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
