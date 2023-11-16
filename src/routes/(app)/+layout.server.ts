import type { LayoutServerLoad } from "./$types";

export const load :LayoutServerLoad = async (event) => {
    if (event.locals.user) {
        return { user: {
            id: event.locals.user.id,
            display_name: event.locals.user.displayName,
            profile_picture_url: event.locals.user.profilePictureUrl
        }};
    }
    return {user:null};
}