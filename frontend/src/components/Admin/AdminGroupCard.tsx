import React from 'react';

interface AdminGroupCardProps {
  group: any;
}

const AdminGroupCard: React.FC<AdminGroupCardProps> = ({ group }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center gap-4">
      <img src={group.avatar || '/default-group.png'} alt="avatar" className="w-14 h-14 rounded-full object-cover border" />
      <div className="flex-1">
        <div className="font-bold text-lg">{group.name}</div>
        <div className="text-gray-600 text-sm mb-1 line-clamp-2">{group.description}</div>
        <div className="text-xs text-gray-500">Members: {group.members?.length + (group.dummyMembers || 0)}</div>
      </div>
    </div>
  );
};

export default AdminGroupCard;
