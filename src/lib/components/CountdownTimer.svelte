<script lang="ts">
	export let time_remaining: number;
    export let defaultDuration: number;
</script>

<div class="items-center inline-flex absolute right-4 font-snapn font-outline font-outline-black">
    <iconify-icon icon="ion:timer-outline" width="32" height="32" flip="horizontal"></iconify-icon>
    <span>
        {#if time_remaining > defaultDuration || time_remaining < 0}
            {defaultDuration}s
        {:else}
            {time_remaining.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}s
        {/if}
    </span>
</div>

