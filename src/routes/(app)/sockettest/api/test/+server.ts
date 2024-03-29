import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
    if (locals.wss) {
        locals.wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(`Hello from the GET handler at ${new Date().toLocaleString()}`);
            }
        });
    }
    return json({ success: true, message: 'Hello world from GET handler', url });
};