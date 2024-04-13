import { DatetimeNowUtc } from "./datetime";


export const establishWebSocket = async (handleMessage: (message: string) => Promise<void>, player: string | undefined = undefined, hide: string | undefined = undefined) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let uri = `${protocol}//${window.location.host}/websocket`;
    if (player && hide) {
        uri = `${protocol}//${window.location.host}/websocket/${player}?hide=${hide}`
    }
    let ws = new WebSocket(uri);
    heartbeat(ws);
    ws.onmessage = async (event) => {
        await handleMessage(event.data)
    };

    ws.onclose = async () => { 
        setTimeout(async () => { ws = await establishWebSocket(handleMessage) }, 5000);
    };

    return ws;
};

function heartbeat(ws: WebSocket | null = null) {
    setTimeout(() => heartbeat(ws), 500);
    if (!ws) return;
    if (ws.readyState !== ws.OPEN) return;

    const wsm : WebSocketMessage = {
        type: WebSocketMessageType.Ping,
        timestamp: DatetimeNowUtc(),
    }
    ws.send(JSON.stringify(wsm));
}

export type WebSocketMessage = {
    type: WebSocketMessageType;
    timestamp: number;
    message?: string;
}

export enum WebSocketMessageType {
    Ping = "ping",
    Pong = "pong",
    Connect = "connect",
    Channel = "channel",
    BrowserSource = "browsersource",
    DraftStarted = "draftstarted",
    NewChoice = "newchoice",
    ChoiceSelected = "choiceselected",
    DraftComplete = "draftcomplete",
    DraftCanceled = "draftcanceled",
    VotingClosed = "votingclosed",
    ChoiceOverride = "choiceoverride",
    PreviewToggled = "previewtoggled",
    BrowserUpdated = "browserupdated",
    ShowDeck = "showdeck",
    VoteUpdated = "voteupdated",
}