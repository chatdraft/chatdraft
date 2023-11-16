// import { fetchSession } from '$lib/server/sessionHandler';
// import { error, type RequestHandler } from '@sveltejs/kit';

// export const POST: RequestHandler = async ( { cookies } ) => {

//     const session_id = cookies.get('session_id');
//     if (!session_id) throw error(400, 'Property "session_id" is required');

//     const session = fetchSession(session_id);
//     if ((!session) || (!session.auth)) {
//         throw error(400, 'Invalid session.');
//     }

//     const tokenData = await session.auth.refreshAccessTokenForUser(session.user_id)

//     // update the session cookie
//     cookies.set('session_id', session_id, {path: '/', httpOnly: true, maxAge: tokenData.expiresIn! })
//     return new Response(null, {status: 302})
// }