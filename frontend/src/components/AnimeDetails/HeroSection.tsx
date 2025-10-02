import React from 'react';
import { Anime } from '../../types';

interface HeroSectionProps {
	anime: Anime;
}

const HeroSection: React.FC<HeroSectionProps> = ({ anime }) => (
	<div className="relative">
		{anime.bannerImage && (
			<div className="absolute inset-0 z-0">
				<img src={anime.bannerImage} alt={anime.title} className="w-full h-96 object-cover" />
				<div className="absolute inset-0 bg-black/60"></div>
			</div>
		)}
		<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="flex-shrink-0">
					<img src={anime.coverImage} alt={anime.title} className="w-64 h-96 object-cover rounded-lg shadow-xl mx-auto lg:mx-0" />
				</div>
				<div className="flex-grow text-center lg:text-left">
					<h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
					{anime.alternativeTitles.length > 0 && (
						<div className="mb-4">
							<p className="text-gray-300 text-sm">Also known as: {anime.alternativeTitles.join(', ')}</p>
						</div>
					)}
					<p className="text-gray-900 dark:text-gray-200 text-lg mb-6 max-w-3xl bg-white/60 dark:bg-transparent rounded p-2">{anime.description}</p>
				</div>
			</div>
		</div>
	</div>
);

export default HeroSection;
