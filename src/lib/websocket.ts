

export const establishWebSocket = async (handleMessage: (message: string) => Promise<void>, player: string | undefined = undefined, hide: string | undefined = undefined) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let uri = `${protocol}//${window.location.host}/websocket`;
    if (player && hide) {
        uri = `${protocol}//${window.location.host}/websocket/${player}?hide=${hide}`
    }
    let ws = new WebSocket(uri);
    heartbeat(ws);
    ws.onmessage = async (event) => {
        if (event.data != 'pong') console.log('[websocket] message received', event);
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
    ws.send("ping");
}