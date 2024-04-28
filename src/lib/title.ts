import { writable } from 'svelte/store';
import { env } from '$env/dynamic/public';

function createTitle() {
	const { subscribe, set } = writable('');

	return {
		subscribe,
		set: (value: string) => {
			set(`${env.PUBLIC_PREVIEW?.toLowerCase() == 'true' ? 'PREVIEW - ' : ''}${value}`);
		},
		clear: () => {
			set(`${env.PUBLIC_PREVIEW?.toLowerCase() == 'true' ? 'PREVIEW - ' : ''}Oro Chat Draft`);
		}
	};
}

export const title = createTitle();
