// src/components/Admin/CurationManger/TopWeekManager.tsx
import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const TopWeekManager: React.FC = () => {
    // --- Configuration ---
    const key = 'topWeek';
    const title = 'Top This Week';
    const badgeColor = 'bg-green-500'; 
    const maxItems = undefined; 

    // --- State ---
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [options] = useState<any[]>([]);
    const [searchQ, setSearchQ] = useState('');
    const [loading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const loadOptions = async () => { /* ... unchanged ... */ };
    
    // --- Initial Load FIX: Cache Busting ---
    useEffect(() => {
    loadOptions();
        (async () => {
            try {
                // FIX: Add a unique timestamp as a query parameter to force a fresh fetch
                const cacheBuster = Date.now();
                const res = await api.get('/anime/admin/curation-state', {
                    params: { _: cacheBuster } 
                });
                setSelectedItems(res.data[key] || []); 
            } catch (err) {
                toast.error(`Failed to fetch initial ${title} state.`);
            }
        })();
    }, []); 

    useEffect(() => { /* ... debounced search effect unchanged ... */ }, [searchQ]);

    // --- Save Logic FIX: Isolation ---
    const saveChanges = async () => {
        setIsSaving(true);
        try {
            const payload: any = {};
            // FIX: Only set the ID list for the current manager's key
            payload[`${key}Ids`] = selectedItems; // Payload: { topWeekIds: [...] }
            
            await api.post('/admin/anime/bulk-labels', payload);
            toast.success(`${title} list updated successfully!`);
            
        } catch (error) {
            toast.error(`Failed to save ${title} list.`);
        } finally {
            setIsSaving(false);
        }
    };

    // ... [JSX Render Logic] ...
    return (
        <div className="space-y-6 max-w-6xl">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Search anime to add to {title}</h2>
                <input 
                    value={searchQ} 
                    onChange={e => setSearchQ(e.target.value)} 
                    placeholder="Search anime..." 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                    disabled={loading}
                />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className={`inline-block w-3 h-3 rounded-full ${badgeColor}`}></span>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">{selectedItems.length} {maxItems && `(Max ${maxItems})`}</span>
                    </div>
                    {/* SAVE BUTTON */}
                    <button 
                        type="button" 
                        onClick={saveChanges} 
                        disabled={isSaving}
                        className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2 
                           ${isSaving ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                
                {/* List of selectable options */}
                <div className="max-h-64 overflow-auto space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500 flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading Options...
                        </div>
                    ) : options.map((o) => (
                        <label key={o._id} className="flex items-center gap-3 text-sm text-gray-900 bg-white rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                            <input 
                                type="checkbox" 
                                checked={selectedItems.includes(o._id)} 
                                onChange={(e:any) => {
                                    const next = e.target.checked 
                                        ? [...selectedItems, o._id] 
                                        : selectedItems.filter((id:string) => id !== o._id);
                                    setSelectedItems(maxItems ? next.slice(0, maxItems) : next);
                                }} 
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="truncate font-medium">{o.title}</span>
                        </label>
                    ))}
                </div>
                
                {/* Visual list of selected items */}
                {selectedItems.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">Current Selection:</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedItems.slice(0, 6).map((id:string) => {
                                const item = options.find(o => o._id === id);
                                return (
                                    <div 
                                        key={id} 
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200" 
                                    >
                                        {item?.coverImage && <img src={item.coverImage} alt="" className="w-6 h-6 rounded object-cover" />}
                                        <span className="text-xs font-medium text-green-700 truncate max-w-[120px]" title={item?.title || id}>{item?.title || id}</span>
                                    </div>
                                );
                            })}
                            {selectedItems.length > 6 && (
                                <div className="px-3 py-2 rounded-lg bg-gray-100 text-xs text-gray-600">
                                    +{selectedItems.length - 6} more
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopWeekManager;