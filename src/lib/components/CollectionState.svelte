<script>
	import { clipboard } from "@skeletonlabs/skeleton";

    const gameStateDir = 'c:\\Users\\%USERNAME%\\AppData\\LocalLow\\Second Dinner\\SNAP\\Standalone\\States\\nvprod\\';

</script>

Click this button to copy the default directory on windows for Snap's game state files
<button class="btn btn-md variant-filled-primary" use:clipboard={gameStateDir}>Click here</button>
<br/>
<input type="file" accept=".json">