import * as install_cards from '$lib/data/cards.json';
import { existsSync, promises as fs } from 'fs';

const updatedCardFile = `./cards.json`;

export async function GetAllCards(): Promise<{all: {cardDefKey: string, variantKey: null, url: string, name: string, description: string, displayImageUrl: string, cost: number }[]}> {
    if (existsSync(updatedCardFile)) {
        const updatedCardContents = await fs.readFile(updatedCardFile, 'utf-8');
        const updatedCards = JSON.parse(updatedCardContents);
        return updatedCards;
    }

    return install_cards;
}

export async function UpdateCards(updatedCards: File) {
    await fs.writeFile(updatedCardFile, Buffer.from(await updatedCards.arrayBuffer()));
}

export async function ResetCards() {
    if (existsSync(updatedCardFile)) {
        await fs.rm(updatedCardFile)
    }
}