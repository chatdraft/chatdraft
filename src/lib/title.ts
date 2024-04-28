import { writable } from 'svelte/store';
import { env } from '$env/dynamic/public';

function createTitle() {
	const { subscribe, set } = writable('');

	return {
		subscribe,
		set: (value: string) => {
			set(`${env.PUBLIC_ENVIRONMENT_LABEL ? `${env.PUBLIC_ENVIRONMENT_LABEL} - ` : ''}${value}`);
		},
		clear: () => {
			set(
				`${env.PUBLIC_ENVIRONMENT_LABEL ? `${env.PUBLIC_ENVIRONMENT_LABEL} - ` : ''}Oro Chat Draft`
			);
		}
	};
}

export const title = createTitle();
