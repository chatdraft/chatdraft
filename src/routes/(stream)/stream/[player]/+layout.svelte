<script lang="ts">
	import { onMount } from 'svelte';
	import '../../../../app.postcss';

	// removes theming from the body so that obs transparency works
	onMount(() => {
		const body = document.querySelector('body');
		body?.setAttribute('data-theme', '');
	});
</script>

<slot />
