
import { existsSync, promises as fs } from 'fs';

const channelsFileName = `./channels.json`;

export async function AddChannel(user_name: string) {
    const channels = await ReadChannels();

    if (channels.includes(user_name)) return;

    channels.push(user_name);

    await fs.writeFile(channelsFileName, JSON.stringify(channels), { encoding: 'utf-8' });
}

export async function RemoveChannel(user_name: string) {
    const channels = await ReadChannels();

    const index = channels.indexOf(user_name);
    if (index > -1) {
        channels.splice(index, 1);
        await fs.writeFile(channelsFileName, JSON.stringify(channels), { encoding: 'utf-8' });
    }
}

export async function ExistsChannel(user_name: string) {
    const channels = await ReadChannels();

    return (channels.includes(user_name));
}

export async function GetChannels() {
    const channels = await ReadChannels();

    return channels;
}

export async function ReadChannels() {
    if (!existsSync(channelsFileName)) {
        return [];
    }

    const data = await fs.readFile(channelsFileName, {encoding: 'utf-8' });
    let channels: string[] = [];
    if (data) {
        channels = JSON.parse(data);
    }

    return channels;
}