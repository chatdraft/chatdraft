import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  event.depends('chatdraft:auth');
  if (event.locals.user) {
    return {
      user: {
        id: event.locals.user.twitchID,
        display_name: event.locals.user.displayName,
        profile_picture_url: event.locals.user.twitchProfilePictureURL,
        name: event.locals.user.channelName,
        initialSetupDone: event.locals.user.initialSetupDone,
        admin: event.locals.user.isAdmin,
      },
    };
  }
  return { user: null };
};
