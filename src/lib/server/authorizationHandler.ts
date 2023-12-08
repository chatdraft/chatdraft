
import { existsSync, promises as fs } from 'fs';

const authorizedUsersFile = `./authorized_users.json`;

export async function userAuthorized(user_name: string) {
    const channels = await ReadAuthorizedUsers();

    return (channels.includes(user_name));
}

export async function getAuthorizedUsers() {
    const channels = await ReadAuthorizedUsers();

    return channels;
}

export async function ReadAuthorizedUsers() {
    if (!existsSync(authorizedUsersFile)) {
        return [];
    }

    const data = await fs.readFile(authorizedUsersFile, {encoding: 'utf-8' });
    let users: string[] = [];
    if (data) {
        users = JSON.parse(data);
    }

    return users;
}