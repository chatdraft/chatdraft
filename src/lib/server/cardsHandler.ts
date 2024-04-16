import * as install_cards from '$lib/data/cards.json';
import { existsSync, promises as fs } from 'fs';

const updatedCardFile = `/home/cards.json`;


/**
 * Returns all cards available on the system currently, either from the installed
 * card database or an updated card file if one is available.
 *
 * @export
 * @async
 * @returns {Promise<{all: {cardDefKey: string, variantKey: null, url: string, name: string, description: string, displayImageUrl: string, cost: number }[]}>}
 */
export async function GetAllCards(): Promise<{all: {cardDefKey: string, variantKey: null, url: string, name: string, description: string, displayImageUrl: string, cost: number }[]}> {
    if (existsSync(updatedCardFile)) {
        const updatedCardContents = await fs.readFile(updatedCardFile, 'utf-8');
        const updatedCards = JSON.parse(updatedCardContents);
        return updatedCards;
    }

    return install_cards;
}


/**
 * Updates the list of available cards on the server to the given card database.
 *
 * @export
 * @async
 * @param {File} updatedCards cards.json file of all cards
 * @returns {*}
 */
export async function UpdateCards(updatedCards: File) {
    await fs.writeFile(updatedCardFile, Buffer.from(await updatedCards.arrayBuffer()));
}


/**
 * Resets the list of available cards on the server to the base installed data
 *
 * @export
 * @async
 * @returns {*}
 */
export async function ResetCards() {
    if (existsSync(updatedCardFile)) {
        await fs.rm(updatedCardFile)
    }
}