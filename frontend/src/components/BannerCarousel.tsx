import React, { useEffect, useRef, useState } from 'react';

interface BannerItem {
	_id?: string;
	title?: string;
	image: string;
	link?: string;
}

const BannerCarousel: React.FC<{ items: BannerItem[] }> = ({ items }) => {
	const [index, setIndex] = useState(0);
	const timer = useRef<number | null>(null);
	const max = Math.min(items.length, 5);
	const visible = items.slice(0, max);

	useEffect(() => {
		if (timer.current) window.clearInterval(timer.current);
		// @ts-ignore
		timer.current = window.setInterval(() => {
			setIndex(i => (i + 1) % Math.max(visible.length, 1));
		}, 4000);
		return () => { if (timer.current) window.clearInterval(timer.current); };
	}, [items.length]);

	if (visible.length === 0) return null;

	return (
		<div className="relative w-full h-80 md:h-96 overflow-hidden">
			{visible.map((item, i) => (
				<a key={i} href={item.link || '#'} target={item.link ? '_blank' : undefined} rel={item.link ? 'noreferrer' : undefined}
					className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}>
					<img src={item.image} alt={item.title || 'banner'} className="w-full h-full object-cover" />
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
				</a>
			))}
			<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
				{visible.map((_, i) => (
					<button key={i} onClick={() => setIndex(i)} className={`w-2.5 h-2.5 rounded-full ${i===index ? 'bg-white' : 'bg-white/50'}`} />
				))}
			</div>
		</div>
	);
};

export default BannerCarousel;


