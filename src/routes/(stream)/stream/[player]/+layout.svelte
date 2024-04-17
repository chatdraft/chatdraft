<script lang="ts">
	import { onMount } from 'svelte';
	import '../../../../app.postcss';

	// removes theming from the body so that obs transparency works
	onMount(() => {
		const body = document.querySelector('body');
		body?.setAttribute('data-theme', '');
	});
</script>

<svelte:head>
	<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
</svelte:head>

<slot />
