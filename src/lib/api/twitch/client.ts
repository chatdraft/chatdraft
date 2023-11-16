import { env } from "$env/dynamic/public";
import { PUBLIC_TWITCH_OAUTH_CLIENT_ID } from "$env/static/public"


export const twitch_login_uri = `https://id.twitch.tv/oauth2/authorize?client_id=${PUBLIC_TWITCH_OAUTH_CLIENT_ID}&redirect_uri=${env.PUBLIC_TWITCH_REDIRECT_URI}&response_type=code&scope=channel%3Aread%3Aredemptions+channel%3Amanage%3Aredemptions`;

