
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Anime } from '../../types';

interface UserMilestoneModalProps {
  userId: string;
  onClose: () => void;
}

const UserMilestoneModal: React.FC<UserMilestoneModalProps> = ({ userId, onClose }) => {
  const [milestones, setMilestones] = useState<string[]>(['', '', '', '', '']);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch current milestone anime for this user
    api.get(`/admin/users/${userId}/milestones`).then(res => {
      const arr = (res.data.milestoneAnime || []).map((m: any) => m.anime?._id || m.anime);
      setMilestones(arr.concat(Array(5 - arr.length).fill('')));
    });
    // Fetch all anime for selection (fetch all, up to 5000)
    api.get('/anime', { params: { limit: 5000 } }).then(res => {
      setAnimeList(res.data.anime || []);
      setFilteredAnime(res.data.anime || []);
      setLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    if (!search) {
      setFilteredAnime(animeList);
    } else {
      setFilteredAnime(animeList.filter(a => a.title.toLowerCase().includes(search.toLowerCase())));
    }
  }, [search, animeList]);

  const handleSelect = (animeId: string, idx: number) => {
    const updated = [...milestones];
    updated[idx] = animeId;
    setMilestones(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    await api.post(`/admin/users/${userId}/milestones`, { animeIds: milestones });
    setSaving(false);
    alert('Milestones updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl relative">
        <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose}>×</button>
        <h2 className="text-xl font-bold mb-4 text-purple-700">Set Milestone Anime for User</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="mb-6">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Search anime by title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {[0,1,2,3,4].map(idx => (
              <div key={idx} className="mb-4">
                <label className="block font-semibold mb-1">Milestone {idx+1}</label>
                <select
                  className="w-full p-2 border rounded"
                  value={milestones[idx] || ''}
                  onChange={e => handleSelect(e.target.value, idx)}
                >
                  <option value="">Select Anime</option>
                  {filteredAnime.map(a => (
                    <option key={a._id} value={a._id}>{a.title}</option>
                  ))}
                </select>
              </div>
            ))}
            <button
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 disabled:opacity-60"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Milestones'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserMilestoneModal;
