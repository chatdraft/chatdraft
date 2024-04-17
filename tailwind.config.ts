import { join } from 'path';
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { skeleton } from '@skeletonlabs/tw-plugin';

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	safelist: [
		{
			pattern: /grid-cols-+/,
		},
		{
			pattern: /bg-opacity-(0|10|20|30|40|50|60|70|80|90|100)/,
		},
	],
	theme: {
		extend:
		{
			fontFamily: {
				'normal': ['Space Grotesk'],
				'snapa': ['CCElephantmenTall'],
				'snapn': ['CCUltimatumBold']
			}
		},
	},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: {
				preset: [
					{
						name: 'wintry',
						enhancements: true
					},
					{
						name: 'rocket',
						enhancements: true
					}
				]
			}
		})
	]
} satisfies Config;
