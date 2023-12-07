import TwitchBot from '$lib/server/twitchBot';
import type { Actions, PageServerLoad } from './$types';


export const load = (async ({locals, url}) => {
    const user = locals.user?.name;
    let botInChannel = false;
    if (user) {
        botInChannel = await TwitchBot.IsBotInChannel(user);
    }
    return { user: user, botInChannel: botInChannel, url_base: url.origin };
}) satisfies PageServerLoad;

export const actions = {
    join: async ({locals}) => {
        if (locals.user) {
            await TwitchBot.JoinChannel(locals.user.name);
        }
    },
    part: async ({locals}) => {
        if (locals.user) {
            await TwitchBot.PartChannel(locals.user.name);
        }
    }
} satisfies Actions