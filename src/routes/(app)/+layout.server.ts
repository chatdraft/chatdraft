import { IsUserAdmin } from "$lib/server/authorizationHandler";
import TwitchBot from "$lib/server/twitchBot";
import type { LayoutServerLoad } from "./$types";

export const load :LayoutServerLoad = async (event) => {
    event.depends('chatdraft:auth')
    if (event.locals.user) {
        const initialSetupDone = await TwitchBot.IsBotInChannel(event.locals.user.name);
        const admin = await IsUserAdmin(event.locals.user.name);
        return { user: {
            id: event.locals.user.id,
            display_name: event.locals.user.displayName,
            profile_picture_url: event.locals.user.profilePictureUrl,
            name: event.locals.user.name,
            initialSetupDone: initialSetupDone,
            admin: admin,
        }};
    }
    return {user:null};
}