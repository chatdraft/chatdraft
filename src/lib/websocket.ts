export const establishWebSocket = async (
  handleMessage: (message: string) => Promise<void>,
  player: string | undefined = undefined,
  hide: string | undefined = undefined
) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  let uri = `${protocol}//${window.location.host}/websocket`;
  if (player && hide) {
    uri = `${protocol}//${window.location.host}/websocket/${player}?hide=${hide}`;
  }
  const ws = new WebSocket(uri);
  heartbeat();
  ws.onmessage = async (event) => {
    console.log('[websocket] message received', event);
    await handleMessage(event.data);
  };

  ws.onclose = async () => {
    setTimeout(establishWebSocket, 5000);
  };

  return ws;
};

function heartbeat(ws: WebSocket | null = null) {
  setTimeout(heartbeat, 500);
  if (!ws) return;
  if (ws.readyState !== 1) return;
  ws.send('ping');
}
