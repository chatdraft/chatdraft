
import { existsSync, promises as fs } from 'fs';

const authorizedUsersFile = `./authorized_users.json`;
const adminUsersFile = `./admin_users.json`;

export async function IsUserAuthorized(user_name: string) {
    const channels = await ReadAuthorizedUsers();

    return (channels.includes(user_name));
}

export async function IsUserAdmin(user_name: string) {
    const admins = await ReadAdminUsers();

    return (admins.includes(user_name));
}

export async function GetAuthorizedUsers() {
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

export async function AuthorizeUser(user_name: string) {
    const channels = await ReadAuthorizedUsers();

    if (channels.includes(user_name)) return;

    channels.push(user_name);

    await fs.writeFile(authorizedUsersFile, JSON.stringify(channels), { encoding: 'utf-8' });
}

export async function DeauthorizeUser(user_name: string) {
    const channels = await ReadAuthorizedUsers();

    const index = channels.indexOf(user_name);
    if (index > -1) {
        channels.splice(index, 1);
        await fs.writeFile(authorizedUsersFile, JSON.stringify(channels), { encoding: 'utf-8' });
    }
}

export async function GetAdminUsers() {
    const channels = await ReadAdminUsers();

    return channels;
}

export async function ReadAdminUsers() {
    if (!existsSync(adminUsersFile)) {
        return [];
    }

    const data = await fs.readFile(adminUsersFile, {encoding: 'utf-8' });
    let users: string[] = [];
    if (data) {
        users = JSON.parse(data);
    }

    return users;
}