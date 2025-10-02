import React from 'react';

interface ScreenshotsProps {
	images: string[];
}

const Screenshots: React.FC<ScreenshotsProps> = ({ images }) => {
	if (!images || images.length === 0) return null;
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Screenshots</h2>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{images.map((img, i) => (
					<img key={i} src={img} alt={`screenshot-${i}`} className="w-full h-40 object-cover rounded" />
				))}
			</div>
		</div>
	);
};

export default Screenshots;
