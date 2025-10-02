import React from 'react';
import { Settings } from 'lucide-react';
import UserTable from '../components/Admin/UserTable';

const AdminUserAccounts: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 bg-white rounded-t-xl px-6 pt-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">User Accounts</h1>
          <div className="text-gray-400 mt-1 text-sm">Manage all registered users, bans, roles, and view user details.</div>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold transition-transform transform hover:scale-[1.01] shadow">
          <Settings className="w-4 h-4" />
          Global Settings
        </button>
      </div>
      <div className="bg-white rounded-b-xl shadow border border-gray-100 p-6">
        <p className="mb-4 text-gray-600">View, search, and manage user accounts. You can ban/unban users, assign admin roles, and see user group/post stats. Click <span className='font-semibold text-yellow-500'>"Details"</span> for more info.</p>
        <UserTable />
      </div>
    </>
  );
};

export default AdminUserAccounts;
