import { PreviewToggled } from "./webSocketUtils";

const previews = new Map<string, boolean>();

/**
 * Gets whether the user has preview status enabled currently
 *
 * @export
 * @param {string} username Twitch channel name for the user to get
 * @returns {boolean} If the user has preview status enabled
 */
export function GetPreviewStatus(username: string) {
    if (previews.has(username)) {
        return previews.get(username)!;
    }
    return false;
}


/**
 * Sets that the user has preview status enabled currently
 *
 * @export
 * @param {string} username Twitch channel name of the user to set
 */
export function SetPreviewStatus(username: string) {
    previews.set(username, true);
    PreviewToggled(username, true);
}

/**
 * Clears the preview status of the given user.
 *
 * @export
 * @param {string} username Twitch channel name of the user to clear.
 */
export function ClearPreviewStatus(username: string) {
    previews.set(username, false);
    PreviewToggled(username, false);
}


/**
 * Toggles the preview status of the given user
 *
 * @export
 * @param {string} username Twitch channel name of the user to toggle.
 */
export function TogglePreviewStatus(username: string) {
    if (previews.has(username) && previews.get(username)) {
        previews.set(username, false)
    }
    else {
        previews.set(username, true);
    }
    PreviewToggled(username, previews.get(username)!);
}