
import { existsSync, promises as fs } from 'fs';
import { readFile } from 'fs/promises';

export async function saveToken(user_id: string, token_data: string) {
    await fs.writeFile(tokenFileName(user_id), JSON.stringify(token_data), { encoding: 'utf-8' });
}

export async function loadToken(user_id: string) {
    const tokenData = await JSON.parse(await readFile(tokenFileName(user_id), { encoding: 'utf-8' }));
    return tokenData;
}

export function existsToken(user_id: string) {
    return existsSync(tokenFileName(user_id));
}

function tokenFileName(user_id: string) {
    return (`./tokens.${user_id}.json`);
}