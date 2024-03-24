<svelte:head>
	<title>oro's chat draft</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

<div class="space-y-4 p-4">
	<h1 class="h1">About Oro Chat Draft</h1>
	<p>
		Oro Chat Draft is an proof of concept for letting Twitch chat draft a Marvel Snap Deck.
		Twitch chat votes on which card to add to the streamer's deck. A browser source
		displays the draft status in real time on stream and a bot in chat announces
		the choices and selections. The streamer doesn't need to interact after
		starting the draft, and can focus on streaming while chat drafts a deck.
		After 12 cards have been selected, the streamer can copy and paste the deck
		code into Marvel Snap.
	</p>
	<p>
        TODO: Add explanation of the channel points permissions requested and screenshot of the Twitch auth page
	</p>
	<h2 class="h2">Commands</h2>
	<p>
		The chat draft bot supports the following commands:
	</p>
	<ul class="list-disc pl-8">
		<li>
			<b>!chatdraft</b> - Provides a basic explanation of chat draft and how to use it
		</li>
		<li>
			<b>!chatdraftstart</b> - Starts a new chat draft.. It also accepts optional parameters for the duration and
			number of cards per round and bonus to subscriber votes. If the parameters are not specified, your
			default draft preferences will be used. This command can only be used by
			the broadcaster and Twitch chat mods.
			Example: <code class="code">!chatdraftstart 90 6 true</code>
			starts a draft with 90 seconds and 6 card choices per round and gives a bonus vote to subscribers.
		</li>
		<li>
			<b>!chatdraftcancel</b> - Cancels the current chat draft. This command can only be
			used by the broadcaster and Twitch chat mods.
		</li>
		<li>
			<b>!chatdraftdeck</b> - Re-displays the most recently drafted deck on stream.
			This command has a global cooldown of 30 seconds and a 60 second per user cooldown.
		</li>
		<li>
			<b>!chatdraftcode</b> - Provides the most recently drafted deck's code in chat
			so a viewer can copy and paste and play along.
			This command has a global cooldown of 30 seconds and a 60 second per user cooldown.
		</li>
	</ul>
	<h2 class="h2">About Us</h2>
	<ul class="list-disc pl-8">
		<li>
			<b><a href="https://github.com/ssbm-oro" class="anchor">oro</a></b> - Lead developer
		</li>
		<li>
			<b><a href="https://twitch.tv/jjrolk" class="anchor">jjrolk</a></b> - Executive producer, designer, testing, support, promotion
		</li>
	</ul>
	<br/>
	Special thanks to Snap.fan for their API and card database.
</div>
