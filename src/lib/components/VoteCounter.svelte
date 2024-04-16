<script lang="ts">
	export let votes : number;
</script>

<div class="flex justify-center absolute bottom-0 right-2">
    <div class="flex items-center">
        <iconify-icon icon="mdi:heart" width="32" height="32" flip="horizontal" class="h-8 stroke-black stroke-1 fill-white drop-shadow-[-2px_2px_2px_var(--tw-shadow-color)] inline-block transform translate-x-1.5"></iconify-icon>
        <span class="font-outline">
            {votes}
        </span>
    </div>
</div>
