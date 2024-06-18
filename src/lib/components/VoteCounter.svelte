<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';

	export let votes: number;
	export let battlerSelected: boolean;
	export let viewerProfilePicture: string | undefined;
</script>

<div class="flex justify-center absolute bottom-1 left-2" class:hidden={!battlerSelected}>
	<div class="flex items-center">
		<Avatar
			src={viewerProfilePicture}
			alt="Viewer Profile Picture"
			width="w-12"
			class="glow-sm glow-yellow-500"
		/>
	</div>
</div>

<div class="flex justify-center absolute bottom-0 right-2">
	<div class="flex items-center">
		<iconify-icon
			icon="mdi:heart"
			width="32"
			height="32"
			flip="horizontal"
			class="h-8 stroke-black stroke-1 fill-white shadow-black drop-shadow-[-2px_2px_2px_var(--tw-shadow-color)] inline-block transform translate-x-1.5"
		/>
		<span class="font-outline">
			{votes}
		</span>
	</div>
</div>
