<svelte:head>
	<title>oro's chat draft</title>
	<meta name="Marvel Snap Twitch Chat Draft" />
</svelte:head>

<div class="space-y-4 p-4">
	<h1 class="h1">About Oro Chat Draft</h1>
	<p>
		The MVP is targeted for Twitch Streamers playing Marvel Snap. The streamer
		(or moderator) can launch a Chat Draft and then the program will run
		without requiring any focus or interaction by the streamer - intent is
		to have no downtime while being live. Twitch chat is presented with 3-6
		random cards and votes to select which card is added to the deck. After
		12 cards are selected, a deck code is created and the streamer can simply
		copy paste to create the drafted deck in the game client.
	</p>
	<p>
        TODO: Add explanation of the channel points permissions requested and screenshot of the Twitch auth page
	</p>
	<h2 class="h2">Twitch Chat Commands</h2>
	<p>
		The chat draft bot supports the following commands:
	</p>
	<h3 class="h3">All Users</h3>
	<ul class="list-disc pl-8">
		<li>
			<b>!chatdraft</b> - Provides a basic explanation of chat draft and how to use it
		</li>
		<li>
			<b>!chatdraftdeck</b> - Display the last complete draft in Browse Source overlay (30s global cooldown, 60s user cooldown).
		</li>
		<li>
			<b>!chatdraftcode</b> - Provide the last complete draft’s Marvel Snap Deck Code (30s global cooldown, 60s user cooldown).
		</li>
	</ul>
	<h3 class="h3">Moderators</h3>
	<ul class="list-disc pl-8">
		<li>
			<b>!chatdraftstart</b> – Start new chat draft using default settings.
		</li>
		<li>
			<b>!chatdraftstart [SS] [C] [true/false]</b> – Start new chat draft with specific parameters: [SS] Time in Seconds, [C] Number of Choices, Subscriber Bonus.
		</li>
		<li>
			<b>!chatdraftcancel</b> – Cancel the current chat draft.
		</li>
	</ul>
	<h2 class="h2">About Us</h2>
	<ul class="list-disc pl-8">
		<li>
			<b><a href="https://github.com/ssbm-oro" class="anchor">oro</a></b> - Lead developer, Draft Mastermind
		</li>
		<li>
			<b><a href="https://twitch.tv/jjrolk" class="anchor">jjrolk</a></b> - Executive producer, Designer, Support
		</li>
	</ul>
	<br/>
	Special thanks to <a class="anchor" href="https://snap.fan">Snap.fan</a> for their API and card database.
</div>
