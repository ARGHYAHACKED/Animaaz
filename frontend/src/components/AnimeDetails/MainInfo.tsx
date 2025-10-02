import React from 'react';
import { Anime, User } from '../../types';
import { Heart, Eye, Star, Bookmark, Share2, MessageCircle } from 'lucide-react';

interface MainInfoProps {
	anime: Anime;
	liked: boolean;
	bookmarked: boolean;
	ratingValue: number | null;
	setRatingValue: (val: number) => void;
	handleLike: () => void;
	handleBookmark: () => void;
	handleShare: () => void;
	setAnime: React.Dispatch<React.SetStateAction<Anime | null>>;
	user: User | null;
	id: string | undefined;
}

const MainInfo: React.FC<MainInfoProps> = ({ anime, liked, bookmarked, ratingValue, setRatingValue, handleLike, handleBookmark, handleShare, setAnime, user, id }) => {
	const totalLikes = (anime.likes?.length || 0) + (anime.dummyLikes || 0);
	const totalViews = (anime.views || 0) + (anime.dummyViews || 0);
	const avgOutOf5 = (anime.averageRating || 0).toFixed(1);
	return (
		<>
			<div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-6 text-white">
				<div className="flex items-center space-x-2">
					<Star className="w-5 h-5 text-yellow-400" />
					<span>{avgOutOf5} / 5</span>
				</div>
				<div className="flex items-center space-x-2">
					<Eye className="w-5 h-5" />
					<span>{totalViews.toLocaleString()}</span>
				</div>
				<div className="flex items-center space-x-2">
					<Heart className="w-5 h-5" />
					<span>{totalLikes.toLocaleString()}</span>
				</div>
				<div className="flex items-center space-x-2">
					<MessageCircle className="w-5 h-5" />
					<span>{anime.comments.length}</span>
				</div>
			</div>
			<div className="mt-4">
				<div className="text-white/90 mb-2">Rate this anime</div>
				<div className="flex items-center gap-1">
					{[1,2,3,4,5].map(v => (
						<button key={v} onClick={async()=>{
							try {
								// @ts-ignore
								const res = await import('../../utils/api').then(api => api.default.post(`/anime/${id}/rate`, { value: v }));
								setAnime(prev => prev ? { ...prev, averageRating: res.data.averageRating, ratingsCount: res.data.ratingsCount } as any : prev);
								setRatingValue(v);
							} catch {}
						}} className={`p-1 rounded ${ (ratingValue||0) >= v ? 'text-yellow-400' : 'text-white/60' }`}>
							<Star className={`w-6 h-6 ${ (ratingValue||0) >= v ? 'fill-yellow-400' : '' }`} />
						</button>
					))}
					<span className="ml-2 text-white/80 text-sm">{(anime.ratingsCount || 0)} ratings</span>
				</div>
			</div>
			<div className="flex flex-wrap justify-center lg:justify-start gap-4">
				<button
					onClick={handleLike}
					className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
						liked
							? 'bg-red-600 hover:bg-red-700 text-white'
							: 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
					}`}
				>
					<Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
					<span>{liked ? 'Liked' : 'Like'}</span>
				</button>
				<button
					onClick={handleBookmark}
					className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
						bookmarked
							? 'bg-blue-600 hover:bg-blue-700 text-white'
							: 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
					}`}
				>
					<Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
					<span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
				</button>
				<button
					onClick={handleShare}
					className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md"
				>
					<Share2 className="w-5 h-5" />
					<span>Share</span>
				</button>
			</div>
		</>
	);
};

export default MainInfo;
