import TwitchBot from "$lib/server/twitchBot";
import type { LayoutServerLoad } from "./$types";

export const load :LayoutServerLoad = async (event) => {
    if (event.locals.user) {
        const initialSetupDone = await TwitchBot.IsBotInChannel(event.locals.user.name);
        return { user: {
            id: event.locals.user.id,
            display_name: event.locals.user.displayName,
            profile_picture_url: event.locals.user.profilePictureUrl,
            name: event.locals.user.name,
            initialSetupDone: initialSetupDone,
        }};
    }
    return {user:null};
}