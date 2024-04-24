<script lang="ts">
	export let pageRouteId: string | null;
	export let routeId: string;
	export let icon: string;

	$: pageSelected =
		routeId != '/(app)' ? pageRouteId && pageRouteId.includes(routeId) : routeId == pageRouteId;
</script>

<div
	class="rounded-lg border-primary-500 aspect-square content-center"
	class:border-2={pageSelected}
>
	<iconify-icon
		style:color={pageSelected ? 'rgba(var(--color-primary-500) / 1)' : ''}
		{icon}
		width="28"
		height="28"
	/>
	<p
		class="mr-2 w-full"
		style:color={pageSelected ? 'rgba(var(--color-primary-500) / 1)' : ''}
		class:underline={pageSelected}
	>
		<slot />
	</p>
</div>
