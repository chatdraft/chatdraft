import { join } from 'path';
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { skeleton } from '@skeletonlabs/tw-plugin';
import plugin from 'tailwindcss/plugin';

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	safelist: [
		{
			pattern: /grid-cols-+/
		},
		{
			pattern: /bg-opacity-(0|10|20|30|40|50|60|70|80|90|100)/
		}
	],
	theme: {
		extend: {
			fontFamily: {
				normal: ['Space Grotesk'],
				snapa: ['CCElephantmenTall'],
				snapn: ['CCUltimatumBold']
			}
		}
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
		}),
		plugin(({ addUtilities, theme }) => {
			const fontOutlineUtilities = {};
			const colors = theme('colors');
			for (const color in colors) {
				if (typeof colors[color] === 'object') {
					for (const shade in colors[color]) {
						fontOutlineUtilities[`.font-outline-${color}-${shade}`] = {
							'--tw-font-outline-color': colors[color][shade]
						};
					}
				} else {
					fontOutlineUtilities[`.font-outline-${color}`] = {
						'--tw-font-outline-color': color
					};
				}
			}
			addUtilities(fontOutlineUtilities);
		})
	]
} satisfies Config;
