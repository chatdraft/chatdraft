import { BrowserSourceUpdated } from "./webSocketUtils";

interface IBrowserSourceInstances {
    full_sources: string[];
    deck_sources: string[];
    choice_sources: string[];
}

export const browserSourceStatuses = new Map<string, IBrowserSourceInstances>();

export function CloseBrowserSource(channel_name: string, websocket_id: string) {
    console.log("CloseBrowserSource")
    if (browserSourceStatuses.has(channel_name)) {
        browserSourceStatuses.get(channel_name)?.full_sources.forEach((ws_id, index) => {
            if (ws_id == websocket_id) {
                browserSourceStatuses.get(channel_name)?.full_sources.splice(index, 1);
            }
        });
        browserSourceStatuses.get(channel_name)?.deck_sources.forEach((ws_id, index) => {
            if (ws_id == websocket_id) {
                browserSourceStatuses.get(channel_name)?.deck_sources.splice(index, 1);
            }
        });
        browserSourceStatuses.get(channel_name)?.choice_sources.forEach((ws_id, index) => {
            if (ws_id == websocket_id) {
                browserSourceStatuses.get(channel_name)?.choice_sources.splice(index, 1);
            }
        });
        BrowserSourceUpdated(channel_name, IsFullSourceConfigured(channel_name), IsDeckSourceConfigured(channel_name), IsChoiceSourceConfigured(channel_name));
    }
}

export function RegisterFullBrowserSource(channel_name: string, websocket_id: string) {
    if (!browserSourceStatuses.has(channel_name)) {
        browserSourceStatuses.set(channel_name, { full_sources: [websocket_id], deck_sources: [], choice_sources: [] })
    }
    else {
        console.log(channel_name)
        browserSourceStatuses.get(channel_name)!.full_sources.push(websocket_id);
    }
    BrowserSourceUpdated(channel_name, IsFullSourceConfigured(channel_name), IsDeckSourceConfigured(channel_name), IsChoiceSourceConfigured(channel_name));
}

export function RegisterDeckBrowserSource(channel_name: string, websocket_id: string) {
    if (!browserSourceStatuses.has(channel_name)) {
        browserSourceStatuses.set(channel_name, { full_sources: [], deck_sources: [websocket_id], choice_sources: [] })
    }
    else {
        if (!browserSourceStatuses.get(channel_name)!.deck_sources) {
            browserSourceStatuses.get(channel_name)!.deck_sources = []
        }
        browserSourceStatuses.get(channel_name)!.deck_sources.push(websocket_id);
    }
    BrowserSourceUpdated(channel_name, IsFullSourceConfigured(channel_name), IsDeckSourceConfigured(channel_name), IsChoiceSourceConfigured(channel_name));
}

export function RegisterChoiceBrowserSource(channel_name: string, websocket_id: string) {
    if (!browserSourceStatuses.has(channel_name)) {
        browserSourceStatuses.set(channel_name, { full_sources: [], deck_sources: [], choice_sources: [websocket_id] })
    }
    else {
        if (!browserSourceStatuses.get(channel_name)!.choice_sources) {
            browserSourceStatuses.get(channel_name)!.choice_sources = []
        }
        browserSourceStatuses.get(channel_name)!.choice_sources.push(websocket_id);
    }
    BrowserSourceUpdated(channel_name, IsFullSourceConfigured(channel_name), IsDeckSourceConfigured(channel_name), IsChoiceSourceConfigured(channel_name));
}

export function IsFullSourceConfigured(channel_name: string) {
    console.log("FullBrowserSource")
    console.log(browserSourceStatuses);
    return ((browserSourceStatuses.has(channel_name)) &&
        (browserSourceStatuses.get(channel_name)!.full_sources.length > 0))
}

export function IsDeckSourceConfigured(channel_name: string) {
    return (
        (browserSourceStatuses.has(channel_name)) &&
        (browserSourceStatuses.get(channel_name)!.deck_sources.length > 0)
    )
}

export function IsChoiceSourceConfigured(channel_name: string) {
    return (
        (browserSourceStatuses.has(channel_name)) &&
        (browserSourceStatuses.get(channel_name)!.choice_sources.length > 0)
    )
}
