import type { Deck } from "./draft";

export const getRandomDeckName = (deck: Deck) => {
    const descriptors = [
        'Bronze',
        'Silver',
        'Gold',
        'Platinum',
        'Diamond',
        'Vibranium',
        'Omega',
        'Galactic',
        'Infinite',
        'Messy',
        'Dangerous',
        'Invincible',
        'Greedy',
        'Hopeless',
        'Cruel',
        'Wild',
        'Anti',
        'Pixelated',
        'Chibi',
        'Silly',
        'Untitled',
        'Mint',
        'Collectible',
        'Rare',
        'Super Rare',
        'Ultimate',
        'Age of',
        'Meta',
        'Spectacular',
        'Amazing',
        'Incredible',
        'Boring',
        'Uncanny',
        'Unauthorized',
        'Relentless',
        'Ongoing',
        'Revealing',
        'Hidden',
        'Obvious',
        'Aggro',
        'Bouncing',
        'Turn Six',
        'Raging',
        'Inked',
        'Double',
        'Discard',
        'Destroy',
        'Mighty',
        'Toxic',
        'Giant-size',
        'Fearless',
        'Selfless',
        'Naughty',
        'Ancient',
        'Tempo',
        'Marvelous',
        'Intrepid',
        'Oily',
        'Secret',
        'Super',
        'Impossible',
        'That',
        'Unstable',
        'Radioactive',
        'Foil',
        'Ripped',
        'Torn',
        'Mythic',
        'A cool',
        'Hungry',
        'Dark',
        'Light',
        'Dead',
        'Manga',
        'Inevitable',
        'Summer Vacation',
        'Very Good',
        'Dirty',
        'Modern',
        'Ancient',
    ];

    const nouns = [
        'Rodeo',
        'IV',
        'Returns',
        'Begins',
        'Rises',
        'Endgame',
        'World',
        'Galaxy',
        'Gaiden',
        'Homecoming',
        'Ragnarok',
        'The First Avenger',
        'Jr',
        'Deck',
        'Casino',
        'Forever',
        'Fanfic',
        'Cosplayer',
        'Revenge',
        'Bait',
        'The Animated Series',
        'Bomb',
        'Cantrip',
        'Netdeck',
        'Ramp',
        'Retreat',
        'Synergy',
        'Mulligan',
        'Brew',
        'Disco',
        'Heaven',
        'Hell',
        'Upgrade',
        'Again',
        'The Movie: The Video Game',
        '& Robin',
        'Origins',
        'Mystery',
        'Redux',
        'Replay',
        'Connection',
        'Affair',
        'Timeline',
        'Comics',
        'Excelsior',
        'Sparkle',
        'Flare',
        'Krackle',
        'Substitute',
        'Arrangement',
        'Shuffle',
        'Studios',
        'Blood',
        'Satellite',
        'Station',
        'of the Galaxy',
        'of the Year',
        'Hologram',
        'Hideout',
        'Fortress',
        'Misprint',
        'Annual',
        'Online',
        'Event',
        'Misplay',
        'Variant',
        'Island',
        'Country',
        'Boosters',
    ]

    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] || '';
    return `${getRandom(descriptors)} ${getRandom(deck.map(card => card.name))} ${getRandom(nouns)}`;
}