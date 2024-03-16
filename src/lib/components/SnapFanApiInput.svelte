<script>
	import { SlideToggle } from "@skeletonlabs/skeleton";

    export let skipSnapFan = false;
    export let snapFanApiKey = '';

</script>
<p>
    You can optionally set up Snap.fan to track your collection
    and sync with Chat Draft so that only cards you own are presented
    in the draft. You can skip this step if you are collection complete.
    You can use <a href="https://snap.fan/u/app/" class="anchor" target="_blank">Snap.fan's App<iconify-icon icon="fluent:window-new-16-filled" width="16" height="16" /></a>
    to automatically sync your collection or update it yourself <a href="https://snap.fan/u/manual-collection/" target="_blank" class="anchor">manually<iconify-icon icon="fluent:window-new-16-filled" width="16" height="16" /></a>
    Oro Chat Draft is not affiliated with Snap.fan. Please see their site for
    more information about setting up their collection tracker.
</p>
<div class="flex card p-4">
    <div class="w-1/2">
        <h4 class="h4 pb-4">
            Full Collection / Skip setting up Snap.fan
        </h4>
        <SlideToggle name="skipSnapFan" bind:checked={skipSnapFan} active="bg-primary-500">Skip Snap.fan setup</SlideToggle>
    </div>
    <div class="min-h-fit w-[1px] mx-4 bg-surface-600"/>
    <div class="w-1/2">
        <h4 class="h4 pb-4">
            Use Snap.fan
        </h4>
        <p class="pb-4">
            Visit your <a class="anchor" target="_blank" href="https://snap.fan/u/settings/">Snap.fan profile<iconify-icon icon="fluent:window-new-16-filled" width="16" height="16" /></a>.
            Click the Api-Key: "Show" button to show your API key. Copy and paste
            it into this text box:
        </p>
        Snap.fan API Key: <input class="input" type="text" disabled={skipSnapFan} bind:value={snapFanApiKey} />
    </div>
</div>