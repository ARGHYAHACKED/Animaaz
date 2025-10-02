import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const GroupManager: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/groups', { params: { limit: 100 } });
    setGroups(res.data.groups || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/groups', {
      name,
      description,
      category,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean)
    });
    setName('');
    setDescription('');
    setCategory('general');
    setTags('');
    await load();
  };

  return (
    <div>
      <form onSubmit={addGroup} className="mb-4 flex gap-2 flex-wrap">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Group Name" className="px-3 py-2 rounded border" required />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="px-3 py-2 rounded border w-64" required />
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded border">
          <option value="general">General</option>
          <option value="anime-specific">Anime Specific</option>
          <option value="genre">Genre</option>
          <option value="seasonal">Seasonal</option>
          <option value="discussion">Discussion</option>
        </select>
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" className="px-3 py-2 rounded border w-48" />
        <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Add Group</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <ul className="space-y-2">
          {groups.map(g => (
            <li key={g._id} className="p-3 rounded border flex items-center justify-between">
              <div>
                <div className="font-bold">{g.name}</div>
                <div className="text-gray-600 text-sm">{g.description}</div>
                <div className="text-xs text-gray-400">{g.category} | {g.tags?.join(', ')}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupManager;
