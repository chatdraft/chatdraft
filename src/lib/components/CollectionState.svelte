<script>
	import { clipboard } from "@skeletonlabs/skeleton";

    const gameStateDir = 'c:\\Users\\%USERNAME%\\AppData\\LocalLow\\Second Dinner\\SNAP\\Standalone\\States\\nvprod\\';

</script>

Click this button to copy the default directory on Windows for Snap's game state files
<button class="btn btn-icon variant-filled-primary" use:clipboard={gameStateDir}>
    <iconify-icon icon="clarity:copy-to-clipboard-line" width="24" height="24" flip="horizontal"></iconify-icon>
</button>
<br/>
<input name="collection" class="m-2" type="file" accept=".json">
<br/>
<button class="btn btn-md variant-filled-primary m-2">Submit</button>