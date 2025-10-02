// src/components/Admin/CurationManager.tsx (UPDATED ROUTER)
import React from 'react';

// Import all the new specific managers with CORRECT SPELLING and Casing
// Assuming your component files are named:
// TrendingManager.tsx, FeaturedManager.tsx, BannerManager.tsx, etc.
import TrendingManager from './CurationManger/TrendingManger'; 
import FeaturedManager from './CurationManger/FeaturedManger';
import BannerManager from './CurationManger/BaneerManager'; // <-- FIX: BannerManager
import TopAiringManager from './CurationManger/TopAirManger'; // <-- FIX: TopAiringManager
import TopWeekManager from './CurationManger/TopWeekManger'; // <-- FIX: TopWeekManager
import ForYouManager from './CurationManger/ForYouManger'; // <-- FIX: ForYouManager

// Define the type for the expected active section keys
type CurationSectionKeys = 'trending' | 'featured' | 'banner' | 'topAiring' | 'topWeek' | 'forYou';

interface CurationManagerProps {
    // This prop must be defined in AdminDashboard.tsx and passed here
    activeSection: CurationSectionKeys; 
}

const CurationManager: React.FC<CurationManagerProps> = ({ activeSection }) => {
    // Mapping object to render the correct component
    const components: Record<CurationSectionKeys, JSX.Element> = {
        trending: <TrendingManager />,
        featured: <FeaturedManager />,
        // Use 'banner' for 'Homepage Banner' tab
        banner: <BannerManager />, 
        topAiring: <TopAiringManager />,
        topWeek: <TopWeekManager />,
        forYou: <ForYouManager />,
    };

    const ActiveComponent = components[activeSection];

    // Render the selected component
    if (!ActiveComponent) {
        // This block executes if 'activeSection' is somehow invalid, 
        // or if a component is missing/failed to load.
        return (
            <div className="p-6 text-gray-500">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Curation Manager</h2>
                <p>Select a curation section from the left sidebar to begin management.</p>
                {/* Add a specific error message for debugging */}
                <p className="mt-4 text-red-500 font-bold">Error: No component found for active section: {activeSection}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* The individual managers contain their own headings/titles */}
            {ActiveComponent}
        </div>
    );
};

export default CurationManager;