import React, { useState } from 'react';

interface CommentItemProps {
  c: any;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ c, depth = 0 }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const isReply = depth > 0;
  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (c.replyTo && replyText.trim()) {
      c.replyTo(c._id, replyText);
      setReplyText('');
      setShowReply(false);
      setShowCommentInput(false);
    }
  };
  const replies = Array.isArray(c.replies) ? c.replies : [];
  // Facebook-style reactions
  const reactions = [
    { type: 'love', emoji: '❤️' },
    { type: 'like', emoji: '👍' },
    { type: 'laugh', emoji: '😂' },
    { type: 'wow', emoji: '😮' },
    { type: 'sad', emoji: '😢' },
    { type: 'angry', emoji: '😡' },
  ];
  const loveCount = (c.reactions || []).filter((r: any) => r.type === 'love').length;
  const userReaction = (c.reactions || []).find((r: any) => r.user === c.currentUserId);
  return (
    <div className={`flex flex-col ${isReply ? 'ml-4 md:ml-8' : ''} mb-4`}>
      <div className="flex items-start gap-3">
        {c.user?.avatar ? (
          <img src={c.user.avatar} alt={c.user.username || 'User'} className="w-8 h-8 rounded-full object-cover mt-1" />
        ) : (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-1">
            {c.user?.username?.charAt(0) || 'U'}
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">{c.user?.username || 'User'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
          </div>
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed break-words mt-1">{c.text}</div>
          {/* Facebook-style action bar */}
          <div className="flex items-center justify-between mt-2">
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                onMouseEnter={() => setShowEmojiPicker(true)}
                onMouseLeave={() => setShowEmojiPicker(false)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs text-gray-700 dark:text-gray-300"
                style={{ minWidth: 44 }}
              >
                <span>{userReaction ? reactions.find(r => r.type === userReaction.type)?.emoji : '❤️'}</span>
                <span>{loveCount}</span>
              </button>
              {showEmojiPicker && (
                <div
                  className="absolute z-10 left-0 top-8 flex gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-2 py-1 animate-fade-in"
                  onMouseEnter={() => setShowEmojiPicker(true)}
                  onMouseLeave={() => setShowEmojiPicker(false)}
                >
                  {reactions.map((r) => (
                    <button
                      key={r.type}
                      className="text-xl hover:scale-125 transition-transform"
                      onClick={() => {
                        if (c.reactWith) c.reactWith(r.type);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-lg" title="Bookmark">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg>
              </button>
              <button className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-lg" title="Comment" onClick={() => setShowCommentInput((v) => !v)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4.28 1.07A1 1 0 013 19.13V17.6c0-.29.13-.56.35-.74A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </button>
            </div>
          </div>
          {showCommentInput && (
            <form onSubmit={handleReply} className="flex gap-2 mt-2">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                placeholder="Write a reply..."
                autoFocus
              />
              <button className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium">Post</button>
            </form>
          )}
        </div>
      </div>
      {/* Replies */}
      {replies.length > 0 && !isReply && (
        <div className="mt-2">
          {!expanded && (
            <button onClick={() => setExpanded(true)} className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1 ml-2">
              Show {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
            </button>
          )}
          {expanded && (
            <>
              {replies.map((reply: any) => (
                <CommentItem key={reply._id} c={{ ...reply, likeComment: c.likeComment, replyTo: c.replyTo }} depth={(depth || 0) + 1} />
              ))}
              <button onClick={() => setExpanded(false)} className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1 ml-2">
                Show less replies
              </button>
            </>
          )}
        </div>
      )}
      {/* Replies for replies (always shown if present) */}
      {replies.length > 0 && isReply && (
        <div className="mt-2">
          {replies.map((reply: any) => (
            <CommentItem key={reply._id} c={{ ...reply, likeComment: c.likeComment, replyTo: c.replyTo, reactWith: c.reactWith, currentUserId: c.currentUserId }} depth={(depth || 0) + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
