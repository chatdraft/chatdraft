export type FeaturedCardMode = 'off' | 'on' | 'full';

export function StringToFeaturedCardMode(featuredCardModeRaw: string | undefined) {
	return featuredCardModeRaw === undefined ||
		(featuredCardModeRaw != 'on' && featuredCardModeRaw != 'full')
		? 'off'
		: featuredCardModeRaw;
}
