import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AdminGroupCard from '../components/Admin/AdminGroupCard';
import AdminGroupModal from '../components/Admin/AdminGroupModal';

const AdminGroups: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/groups', { params: { limit: 50 } });
        setGroups(res.data.groups || []);
      } catch (err: any) {
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupClick = async (group: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/groups/${group._id}`);
      setSelectedGroup(res.data);
    } catch (err: any) {
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin: Manage Groups</h1>
      {loading && <div>Loading groups...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div>
        {groups.map(group => (
          <div key={group._id} onClick={() => handleGroupClick(group)}>
            <AdminGroupCard group={group} />
          </div>
        ))}
      </div>
      {selectedGroup && (
        <AdminGroupModal group={selectedGroup} onClose={() => setSelectedGroup(null)} />
      )}
    </div>
  );
};

export default AdminGroups;
