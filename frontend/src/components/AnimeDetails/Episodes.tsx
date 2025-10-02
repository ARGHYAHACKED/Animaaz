import React from 'react';
import { Episode } from '../../types';
import { Play } from 'lucide-react';

interface EpisodesProps {
	episodes: Episode[];
}

const Episodes: React.FC<EpisodesProps> = ({ episodes }) => {
	if (!episodes || episodes.length === 0) return null;
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Episodes</h2>
			<div className="space-y-3">
				{episodes.map((episode) => (
					<div key={episode.number} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div>
							<h3 className="font-semibold text-gray-900 dark:text-white">
								Episode {episode.number}: {episode.title}
							</h3>
							{episode.description && (
								<p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{episode.description}</p>
							)}
							{episode.duration && (
								<p className="text-gray-500 dark:text-gray-500 text-sm">Duration: {episode.duration} minutes</p>
							)}
						</div>
						{episode.watchLink && (
							<a
								href={episode.watchLink}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
							>
								<Play className="w-4 h-4" />
								<span>Watch</span>
							</a>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Episodes;
