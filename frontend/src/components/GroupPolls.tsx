import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface Poll {
  _id?: string;
  question: string;
  options: string[];
  votes: { option: number; user: string }[];
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface GroupPollsProps {
  groupId: string;
  polls: Poll[];
  isOwner: boolean;
  onPollCreated?: () => void;
}

const GroupPolls: React.FC<GroupPollsProps> = ({ groupId, polls, isOwner, onPollCreated }) => {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(opts => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  const addOption = () => {
    if (options.length < 10) setOptions([...options, '']);
  };
  const removeOption = (idx: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!question.trim() || options.some(opt => !opt.trim())) {
      setError('Please enter a question and at least two options.');
      return;
    }
    setCreating(true);
    try {
      await api.post(`/groups/${groupId}/polls`, {
        question,
        options: options.map(opt => opt.trim()),
      });
      setShowCreate(false);
      setQuestion('');
      setOptions(['', '']);
      if (onPollCreated) onPollCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  // Voting state
  const [voting, setVoting] = useState<{ [pollId: string]: number | null }>({});
  const [submittingVote, setSubmittingVote] = useState<{ [pollId: string]: boolean }>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  // Helper: get user's vote for a poll
  const getUserVote = (poll: Poll) => {
    if (!user) return null;
    const found = poll.votes.find(v => v.user === user.id || v.user === (user as any)._id);
    return found ? found.option : null;
  };

  // Vote handler
  const handleVote = async (pollId: string, option: number) => {
    setSubmittingVote(s => ({ ...s, [pollId]: true }));
    try {
      await api.post(`/groups/${groupId}/polls/${pollId}/vote`, { option });
      if (onPollCreated) onPollCreated();
    } catch {}
    setSubmittingVote(s => ({ ...s, [pollId]: false }));
  };

  // Delete poll handler
  const handleDelete = async (pollId: string) => {
    if (!window.confirm('Delete this poll?')) return;
    setDeleting(pollId);
    try {
      await api.delete(`/groups/${groupId}/polls/${pollId}`);
      if (onPollCreated) onPollCreated();
    } catch {}
    setDeleting(null);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Polls</h3>
        {isOwner && (
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            onClick={() => setShowCreate(v => !v)}
          >
            {showCreate ? 'Cancel' : 'Add Poll'}
          </button>
        )}
      </div>
      {showCreate && isOwner && (
        <form onSubmit={handleCreate} className="mb-4 space-y-2 bg-gray-800 p-4 rounded-lg">
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700"
            placeholder="Poll question"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            maxLength={500}
            required
          />
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 mb-1">
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                maxLength={100}
                required
              />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(idx)} className="text-red-400">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOption} className="text-blue-400 text-sm">+ Add option</button>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700" disabled={creating}>
            {creating ? 'Creating...' : 'Create Poll'}
          </button>
        </form>
      )}
      <div className="space-y-4">
        {polls.length === 0 && <div className="text-gray-400">No polls yet.</div>}
        {polls.map((poll) => {
          const userVote = getUserVote(poll);
          const totalVotes = poll.votes.length;
          return (
            <div key={poll._id} className="bg-gray-800 rounded-lg p-4 mb-2 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-white text-base">{poll.question}</div>
                {isOwner && (
                  <button
                    className="text-red-400 text-xs ml-2 hover:underline"
                    onClick={() => handleDelete(poll._id!)}
                    disabled={deleting === poll._id}
                  >
                    {deleting === poll._id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (userVote == null && voting[poll._id!] != null) handleVote(poll._id!, voting[poll._id!]!);
                }}
              >
                <div className="space-y-2">
                  {poll.options.map((opt, idx) => {
                    const count = poll.votes.filter(v => v.option === idx).length;
                    const percent = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
                    const isChecked = userVote === idx;
                    return (
                      <label key={idx} className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition ${isChecked ? 'bg-blue-900/60' : 'hover:bg-gray-700/60'}`}>
                        <input
                          type="radio"
                          name={`poll-${poll._id}`}
                          value={idx}
                          checked={userVote === idx || voting[poll._id!] === idx}
                          disabled={userVote != null || submittingVote[poll._id!]}
                          onChange={() => setVoting(v => ({ ...v, [poll._id!]: idx }))}
                          className="accent-blue-500"
                        />
                        <span className="flex-1 text-gray-200 text-sm">{opt}</span>
                        <span className="text-xs text-gray-400 min-w-[32px] text-right">{count} ({percent}%)</span>
                        <div className="w-1/3 bg-gray-700 rounded h-2 ml-2">
                          <div className="bg-blue-500 h-2 rounded" style={{ width: `${percent}%` }} />
                        </div>
                      </label>
                    );
                  })}
                </div>
                {user && userVote == null && (
                  <button
                    type="submit"
                    className="mt-2 px-4 py-1.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 text-sm"
                    disabled={voting[poll._id!] == null || submittingVote[poll._id!]}
                  >
                    {submittingVote[poll._id!] ? 'Submitting...' : 'Vote'}
                  </button>
                )}
                {user && userVote != null && (
                  <div className="mt-2 text-green-400 text-xs">You voted: {poll.options[userVote]}</div>
                )}
              </form>
              <div className="text-xs text-gray-500 mt-2">Total votes: {totalVotes}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupPolls;
