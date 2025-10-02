

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const FollowingSidebar = () => {
	const { user } = useAuth();
	const [followers, setFollowers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchFollowers = async () => {
			if (!user?.id) return;
			setLoading(true);
			try {
				const res = await api.get(`/users/${user.id}`);
				setFollowers(res.data.followers || []);
			} catch (err) {
				setFollowers([]);
			} finally {
				setLoading(false);
			}
		};
		fetchFollowers();
	}, [user?.id]);

	return (
		<div className="p-4">
			<h2 className="text-lg font-bold mb-2">Followers</h2>
			{loading ? (
				<div className="text-gray-500">Loading...</div>
			) : followers.length === 0 ? (
				<div className="text-gray-500">No followers yet.</div>
			) : (
				<ul className="space-y-3">
					{followers.map(follower => (
						<li key={follower._id}>
							<Link to={`/profile/${follower._id}`} className="flex items-center gap-3 hover:bg-purple-50 rounded p-2 transition">
								<img
									src={follower.avatar || '/default-avatar.png'}
									alt={follower.username}
									className="w-10 h-10 rounded-full object-cover border border-gray-200"
								/>
								<span className="font-medium text-gray-800">{follower.username}</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default FollowingSidebar;
