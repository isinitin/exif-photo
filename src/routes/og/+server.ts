import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from './$types';

const fontMedium = await fetch(
	'https://og-playground.vercel.app/inter-latin-ext-400-normal.woff'
).then((res) => res.arrayBuffer());
const fontBold = await fetch(
	'https://og-playground.vercel.app/inter-latin-ext-700-normal.woff'
).then((res) => res.arrayBuffer());

export const GET: RequestHandler = async ({ url }) => {
	const title = url.searchParams.get('title') || 'Lensy';
	const description =
		url.searchParams.get('description') ||
		'An editorial photography gallery capturing brutalist horizons, delicate glass layers, and the profound depth of human stillness.';
	const image = url.searchParams.get('image');

	const template = `
		<div tw="flex flex-col w-full h-full bg-[#111] text-[#FDFBF7] relative">
			${image ? `<img src="${image}" tw="absolute inset-0 w-full h-full object-cover" />` : ''}
			<div tw="absolute inset-0 flex bg-black/40" />
			<div tw="flex flex-col w-full h-full pt-16 pb-20 px-20 relative justify-end">
				<div tw="absolute top-16 left-20 flex text-3xl font-bold tracking-widest uppercase">
					LENSY
				</div>
				<div tw="flex flex-col max-w-[800px] mt-auto">
					<h1 tw="text-6xl font-bold tracking-tight text-white mb-6">${title}</h1>
					<p tw="text-4xl text-gray-200" style="line-height: 1.4;">${description}</p>
				</div>
			</div>
		</div>
	`;

	return await new ImageResponse(template, {
		height: 630,
		width: 1200,
		fonts: [
			{
				name: 'Inter',
				data: fontMedium,
				weight: 400
			},
			{
				name: 'Inter',
				data: fontBold,
				weight: 700
			}
		]
	});
};
