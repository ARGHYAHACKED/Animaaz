import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AnimeCard from '../components/AnimeCard';


const TopWeek: React.FC = () => {
	const [list, setList] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCurated = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.get('/curation/topWeek');
				setList(res.data.animeIds || []);
			} catch (err: any) {
				setError(err?.response?.data?.message || 'Failed to fetch curated list');
				setList([]);
			} finally {
				setLoading(false);
			}
		};
		fetchCurated();
	}, []);

	return (
		<div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
			<h1 className="text-2xl font-semibold mb-4">Top This Week</h1>
			{loading ? (
				<div className="opacity-70">Loading...</div>
			) : error ? (
				<div className="text-red-500 mb-4">{error}</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
					{list.length === 0 ? (
						<div className="col-span-full text-blue-600">No curated anime in Top This Week list.</div>
					) : (
						list.map((a) => <AnimeCard key={a._id} anime={a} />)
					)}
				</div>
			)}
		</div>
	);
};

export default TopWeek;
