import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminGroupModalProps {
  group: any;
  onClose: () => void;
}

const AdminGroupModal: React.FC<AdminGroupModalProps> = ({ group, onClose }) => {
  const navigate = useNavigate();
  if (!group) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-2">{group.name}</h2>
        <div className="text-gray-600 text-sm mb-2">{group.description}</div>
        <div className="mb-4">Members:</div>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {group.members && group.members.length > 0 ? (
            group.members.map((memberObj: any, idx: number) => {
              const member = memberObj.user || memberObj; // support both {user, ...} and user directly
              return (
                <div key={member._id || idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded" onClick={() => navigate(`/profile/${member._id}`)}>
                  <img src={member.avatar || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-semibold">{member.username}</span>
                </div>
              );
            })
          ) : (
            <div className="text-gray-400 text-sm">No members found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGroupModal;
