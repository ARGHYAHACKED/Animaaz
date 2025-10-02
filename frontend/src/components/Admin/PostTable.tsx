import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const PostTable: React.FC = () => {
	const [posts, setPosts] = useState<any[]>([]);
	const [q, setQ] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);

	const load = async (p = 1) => {
		setLoading(true);
		const res = await api.get('/admin/posts', { params: { page: p, limit: 20, search: q || undefined } });
		setPosts(res.data.posts || []);
		setTotalPages(res.data.pagination?.pages || 1);
		setLoading(false);
	};

	useEffect(() => { load(1); }, []);

	return (
		<div className="rounded border dark:border-gray-700 p-4">
			<div className="flex items-center justify-between mb-3">
				<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts..." className="px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800" />
				<button onClick={() => load(1)} className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white">Search</button>
			</div>
			{loading ? (
				<div className="opacity-70">Loading...</div>
			) : (
				<div className="overflow-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-left">
								<th className="p-2">Author</th>
								<th className="p-2">Title/Content</th>
								<th className="p-2">Type</th>
								<th className="p-2">Likes</th>
								<th className="p-2">Dummy Likes</th>
								<th className="p-2">Created</th>
								<th className="p-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{posts.map(p => (
								<tr key={p._id} className="border-t dark:border-gray-700">
									<td className="p-2">{p.user?.username || 'User'}</td>
									<td className="p-2 max-w-[320px] truncate" title={p.title || p.content}>{p.title || p.content}</td>
									<td className="p-2">{p.type}</td>
									<td className="p-2">{(p.likes || []).length}</td>
									<td className="p-2">{p.dummyLikes || 0}</td>
									<td className="p-2">{new Date(p.createdAt).toLocaleString()}</td>
									<td className="p-2 space-x-2">
										<a href={`/posts/${p._id}`} className="text-purple-600 hover:underline">View</a>
										<button onClick={async()=>{ const title = prompt('Title', p.title || ''); const content = prompt('Content', p.content || ''); if (title !== null && content !== null) { await api.put(`/admin/posts/${p._id}`, { title, content }); await load(page); } }} className="text-blue-600 hover:underline">Edit</button>
										<button onClick={async()=>{ const v = prompt('Dummy likes', String(p.dummyLikes || 0)); if (v !== null) { const count = Number(v); if (!Number.isNaN(count)) { await api.post(`/admin/posts/${p._id}/boost`, { count }); await load(page); } }} } className="text-yellow-600 hover:underline">Boost</button>
										<button onClick={async()=>{ if (confirm('Delete post?')) { await api.delete(`/admin/posts/${p._id}`); await load(page); } }} className="text-red-600 hover:underline">Delete</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			<div className="flex items-center justify-end gap-2 mt-3">
				<button disabled={page<=1} onClick={()=>{ const next = page-1; setPage(next); load(next); }} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Prev</button>
				<div className="text-sm">Page {page} / {totalPages}</div>
				<button disabled={page>=totalPages} onClick={()=>{ const next = page+1; setPage(next); load(next); }} className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Next</button>
			</div>
		</div>
	);
};

export default PostTable;
