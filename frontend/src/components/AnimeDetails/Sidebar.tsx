import React from 'react';
import { Anime } from '../../types';
import { Link } from 'react-router-dom';

interface SidebarProps {
	anime: Anime;
}

const Sidebar: React.FC<SidebarProps> = ({ anime }) => (
	<div className="space-y-6 lg:sticky lg:top-24 self-start">
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Information</h3>
			<div className="space-y-3">
				<div>
					<span className="text-gray-600 dark:text-gray-400">Status:</span>
					<span className="ml-2 capitalize text-gray-900 dark:text-white">{anime.status}</span>
				</div>
				<div>
					<span className="text-gray-600 dark:text-gray-400">Year:</span>
					<span className="ml-2 text-gray-900 dark:text-white">{anime.year}</span>
				</div>
				{anime.season && (
					<div>
						<span className="text-gray-600 dark:text-gray-400">Season:</span>
						<span className="ml-2 capitalize text-gray-900 dark:text-white">{anime.season}</span>
					</div>
				)}
				<div>
					<span className="text-gray-600 dark:text-gray-400">Episodes:</span>
					<span className="ml-2 text-gray-900 dark:text-white">{anime.totalEpisodes > 0 ? anime.totalEpisodes : 'TBA'}</span>
				</div>
				{anime.studio && (
					<div>
						<span className="text-gray-600 dark:text-gray-400">Studio:</span>
						<span className="ml-2 text-gray-900 dark:text-white">{anime.studio}</span>
					</div>
				)}
				{anime.director && (
					<div>
						<span className="text-gray-600 dark:text-gray-400">Director:</span>
						<span className="ml-2 text-gray-900 dark:text-white">{anime.director}</span>
					</div>
				)}
			</div>
		</div>
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genres</h3>
			<div className="flex flex-wrap gap-2">
				{anime.genres.map((genre, index) => (
					<Link
						key={index}
						to={`/genre/${encodeURIComponent(genre)}`}
						className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm px-3 py-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
					>
						{genre}
					</Link>
				))}
			</div>
		</div>
		{anime.tags.length > 0 && (
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
				<div className="flex flex-wrap gap-2">
					{anime.tags.map((tag, index) => (
						<span
							key={index}
							className="inline-block bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full"
						>
							#{tag}
						</span>
					))}
				</div>
			</div>
		)}
		{anime.watchLinks.length > 0 && (
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Watch On</h3>
				<div className="space-y-2">
					{anime.watchLinks.map((link, index) => (
						<a
							key={index}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
						>
							<span className="text-gray-900 dark:text-white font-medium">{link.platform}</span>
							<span className="text-gray-500 dark:text-gray-400 text-sm">{link.quality}</span>
						</a>
					))}
				</div>
			</div>
		)}
	</div>
);

export default Sidebar;
