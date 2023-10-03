import { error, type RequestHandler } from '@sveltejs/kit';
import { Choose } from '$lib/snap/draft';

export const PUT: RequestHandler = async ( { params, platform }) => {
	if (!platform?.env.KV) { throw error(503) }

    const value = await platform.env.KV.get(params.player + "/draft");
    if (!value) { throw error(404) }

    const draft = JSON.parse(value)
    if (!params.card) { throw error(400) }

    let choice;
    switch(params.card) {
        case '1':
            choice = draft.currentChoice.card1;
            break;
        case '2':
            choice = draft.currentChoice.card2;
            break;
        case '3':
            choice = draft.currentChoice.card3;
            break;
    }

    console.log('----before----');
    console.log(draft);
    console.log('--------------');
    Choose(draft, choice.cardDefKey);
    console.log('----after-----');
    console.log(draft);
    await platform.env.KV.put(params.player + "/draft", JSON.stringify(draft));

    return new Response();    
};