<script lang="ts">
	import '../../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { AppBar, AppShell, storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4" slotFooter="bg-surface-700 text-center">
	<svelte:fragment slot="header">
		<AppBar>Chat Draft</AppBar></svelte:fragment
	>
	<svelte:fragment slot="sidebarLeft">
		<nav class="list-nav">
			<ul>
				<li>
					<a href="/">Home</a>
				</li>
				<li>
					<a href="about">About</a>
				</li>
				<li>
					<a href="mockdraft">Mock Draft</a>
				</li>
				<li>
					<a href="stream" target="_blank">Stream View</a>
				</li>
			</ul>
		</nav>
	</svelte:fragment>
	<!-- (sidebarRight) -->
	<!-- (pageHeader) -->
	<!-- Router Slot -->
	<slot />
	<!-- ---- / ---- -->
	<svelte:fragment slot="footer">©2023 oro</svelte:fragment>
	<!-- (footer) -->
</AppShell>
