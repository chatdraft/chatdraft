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
			<div class="grid items-center grid-cols-2 w-screen">
				<div>
					Chat Draft
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
						<a href="mockdraft">Mock Draft</a>
					</li>
					<li>
						<a href="{`stream/${user.name}`}" target="_blank">Stream View</a>
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
					{@html `<a target="_blank" href="https://www.buymeacoffee.com/oro.lol"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me coffee&emoji=☕&slug=oro.lol&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>`}
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
