import { PreviewToggled } from "./webSocketUtils";

const previews = new Map<string, boolean>();

export function GetPreviewStatus(username: string) {
    if (previews.has(username)) {
        return previews.get(username)!;
    }
    return true;
}

export function SetPreviewStatus(username: string) {
    previews.set(username, true);
    PreviewToggled(username, true);
}

export function ClearPreviewStatus(username: string) {
    previews.set(username, false);
    PreviewToggled(username, false);
}

export function TogglePreviewStatus(username: string) {
    if (previews.has(username) && previews.get(username)) {
        previews.set(username, false)
    }
    else {
        previews.set(username, true);
    }
    PreviewToggled(username, previews.get(username)!);
}