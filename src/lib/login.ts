export function GetLoginUri(redirectUri: string | null, currentPage: string) {
	// if we have a specified redirectUri, use that. otherwise, use the current page if it isn't '/'
	const finalRedirectUri = redirectUri ? redirectUri : currentPage != '/' ? currentPage : undefined;

	return `/api/v1/login${finalRedirectUri ? `?redirect=${finalRedirectUri}` : ''}`;
}
