import TwitchBot from '$lib/server/twitchBot';
import type { PageServerLoad } from './$types';


export const load = (async ({locals, url}) => {
    const user = locals.user?.name;
    let botInChannel = false;
    if (user) {
        botInChannel = await TwitchBot.IsBotInChannel(user);
    }
    return { user: user, botInChannel: botInChannel, url_base: url.origin };
}) satisfies PageServerLoad;