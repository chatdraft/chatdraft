<script lang="ts">
	import { page } from '$app/stores';
	import { twitch_bot_uri, twitch_login_uri } from '$lib/api/twitch/client';
	import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import { env } from '$env/dynamic/public';
	import AppRailIcon from './AppRailIcon.svelte';
	import type { User, UserAuthorization } from '@prisma/client';

	export let user: (User & { authorization: UserAuthorization | null }) | null;
</script>

<AppRail class="text-center overflow-x-hidden h-full">
	<AppRailAnchor href="/">
		<AppRailIcon pageRouteId={$page.route.id} routeId="/(app)" icon="material-symbols:home">
			Home
		</AppRailIcon>
	</AppRailAnchor>
	<AppRailAnchor href="/about">
		<AppRailIcon pageRouteId={$page.route.id} routeId="/about" icon="material-symbols:info-outline">
			About
		</AppRailIcon>
	</AppRailAnchor>

	<AppRailAnchor href="/solodraft" class="hidden">
		<AppRailIcon pageRouteId={$page.route.id} routeId="/solodraft" icon="mdi:cards-outline">
			Solo Draft
		</AppRailIcon>
	</AppRailAnchor>

	{#if user}
		<AppRailAnchor href="/settings">
			<AppRailIcon pageRouteId={$page.route.id} routeId="/settings" icon="mdi:gear">
				Settings
			</AppRailIcon>
		</AppRailAnchor>
		{#if user.isAdmin || (user.authorization && user.authorization.chatDraft)}
			{#if user.initialSetupDone}
				<AppRailAnchor href="/draft">
					<AppRailIcon pageRouteId={$page.route.id} routeId="/draft" icon="carbon:chat-bot">
						Chat Draft
					</AppRailIcon>
				</AppRailAnchor>
			{:else}
				<AppRailAnchor href="/start">
					<AppRailIcon pageRouteId={$page.route.id} routeId="/start" icon="ion:rocket-sharp">
						Get Started
					</AppRailIcon>
				</AppRailAnchor>
			{/if}
		{/if}
		{#if user.isAdmin || (user.authorization && user.authorization.cubeDraft)}
			<AppRailAnchor href="/cubedraft">
				<AppRailIcon pageRouteId={$page.route.id} routeId="/cubedraft" icon="mdi:cube-outline">
					Cube Draft
				</AppRailIcon>
			</AppRailAnchor>
		{/if}
		{#if user.isAdmin || (user.authorization && user.authorization.soloDraft)}
			<AppRailAnchor href="/solodraft">
				<AppRailIcon pageRouteId={$page.route.id} routeId="/solodraft" icon="mdi:cards">
					Solo Draft
				</AppRailIcon>
			</AppRailAnchor>
		{/if}
	{/if}

	{#if user && (user.isOrganizer || user.isAdmin)}
		<AppRailAnchor href="/organizer">
			<AppRailIcon pageRouteId={$page.route.id} routeId="/organizer" icon="mdi:trophy"
				>Org</AppRailIcon
			>
		</AppRailAnchor>
	{/if}
	{#if user && user.isAdmin}
		<AppRailAnchor href="/admin">
			<AppRailIcon pageRouteId={$page.route.id} routeId="/admin" icon="mdi:administrator">
				Admin
			</AppRailIcon>
		</AppRailAnchor>
	{/if}
	{#if user && user.twitchID == env.PUBLIC_TWITCH_USER_ID}
		<AppRailAnchor href={twitch_bot_uri}>
			<iconify-icon icon="mdi:wrench" width="28" height="28" />
			<span class="mr-2 w-full">Setup Chatbot</span>
		</AppRailAnchor>
	{/if}
	{#if !user}
		<AppRailAnchor href={twitch_login_uri}>
			<iconify-icon icon="ri:twitch-fill" width="24" height="24" />
			<p class="mr-2 w-full">Log in</p>
		</AppRailAnchor>
	{:else}
		<AppRailAnchor href="/logout" data-sveltekit-preload-data="tap" data-sveltekit-reload>
			<iconify-icon icon="material-symbols:logout" width="28" height="28" />
			<p class="mr-2 w-full">Logout</p>
		</AppRailAnchor>
	{/if}
	<svelte:fragment slot="trail" />
</AppRail>
