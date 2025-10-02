
import React, { useState } from 'react';
import { Comment, User } from '../../types';

interface CommentsProps {
	comments: Comment[];
	user: User | null;
	newComment: string;
	setNewComment: (val: string) => void;
	submittingComment: boolean;
	handleCommentSubmit: (e: React.FormEvent) => void;
}

const Comments: React.FC<CommentsProps> = ({ comments, user, newComment, setNewComment, submittingComment, handleCommentSubmit }) => {
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyText, setReplyText] = useState('');
	const [submittingReply, setSubmittingReply] = useState(false);
	const [localComments, setLocalComments] = useState<Comment[]>(comments);

	// Update localComments if prop changes
	React.useEffect(() => {
		setLocalComments(comments);
	}, [comments]);

	// Add reply to local state for instant UI feedback
	const handleReplySubmit = async (parentId: string, e: React.FormEvent) => {
		e.preventDefault();
		setSubmittingReply(true);
		// Simulate reply creation
		setTimeout(() => {
			if (!replyText.trim()) {
				setSubmittingReply(false);
				return;
			}
			setLocalComments(prev => {
				// Find parent comment or reply recursively
				const addReply = (items: Comment[]): Comment[] => items.map(item => {
					if (item._id === parentId) {
						return {
							...item,
							replies: [
								...item.replies,
								{
									_id: Math.random().toString(36).substr(2, 9),
									text: replyText,
									user: user!,
									parentComment: parentId,
									replies: [],
									likes: [],
									isActive: true,
									edited: false,
									createdAt: new Date(),
									updatedAt: new Date(),
								}
							]
						};
					}
					return {
						...item,
						replies: addReply(item.replies)
					};
				});
				return addReply(prev);
			});
			setReplyText('');
			setReplyingTo(null);
			setSubmittingReply(false);
		}, 500);
	};

		// Recursive render for nested replies
		const renderReplies = (replies: Comment[], parentId: string) => {
			return (
				<div className="ml-8 mt-2 space-y-2">
					{replies.map((reply, idx) => {
						const hasUser = reply.user && typeof reply.user === 'object';
						return (
							<div key={reply._id || `${parentId}-reply-${idx}`} className="flex space-x-3">
								<div className="flex-shrink-0">
									{hasUser && reply.user.avatar ? (
										<img src={reply.user.avatar} alt={reply.user.username || 'User'} className="w-8 h-8 rounded-full" />
									) : (
										<div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
											<span className="text-white font-medium text-xs">{hasUser && reply.user.username ? reply.user.username.charAt(0).toUpperCase() : '?'}</span>
										</div>
									)}
								</div>
								<div className="flex-grow">
									<div className="flex items-center space-x-2 mb-1">
										<span className="font-semibold text-gray-900 dark:text-white">{hasUser && reply.user.username ? reply.user.username : 'Unknown'}</span>
										<span className="text-gray-500 dark:text-gray-400 text-xs">{new Date(reply.createdAt).toLocaleDateString()}</span>
									</div>
									<p className="text-gray-700 dark:text-gray-300">{reply.text}</p>
									{user && (
										<button
											className="text-purple-600 dark:text-purple-400 text-xs mt-1 hover:underline"
											onClick={() => setReplyingTo(reply._id)}
										>Reply</button>
									)}
									{/* Reply form for this reply */}
									{replyingTo === reply._id && user && (
										<form onSubmit={(e) => handleReplySubmit(reply._id, e)} className="mt-2">
											<textarea
												value={replyText}
												onChange={(e) => setReplyText(e.target.value)}
												placeholder={`Reply to ${hasUser && reply.user.username ? reply.user.username : 'this user'}...`}
												className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs resize-none"
												rows={2}
											/>
											<div className="flex justify-end mt-1">
												<button
													type="submit"
													disabled={!replyText.trim() || submittingReply}
													className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1 rounded text-xs font-semibold"
												>
													{submittingReply ? 'Posting...' : 'Reply'}
												</button>
											</div>
										</form>
									)}
									{/* Nested replies */}
									{reply.replies && reply.replies.length > 0 && renderReplies(reply.replies, reply._id || `${parentId}-reply-${idx}`)}
								</div>
							</div>
						);
					})}
				</div>
			);
		};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
				Comments ({comments.length})
			</h2>
			{user ? (
				<form onSubmit={handleCommentSubmit} className="mb-6">
					<textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="Share your thoughts about this anime..."
						className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
						rows={3}
					/>
					<div className="flex justify-end mt-2">
						<button
							type="submit"
							disabled={!newComment.trim() || submittingComment}
							className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
						>
							{submittingComment ? 'Posting...' : 'Post Comment'}
						</button>
					</div>
				</form>
			) : (
				<p className="text-gray-600 dark:text-gray-400 mb-6 text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
					<a href="/login" className="text-purple-600 dark:text-purple-400 hover:underline">Login</a> to post a comment
				</p>
			)}
			<div className="space-y-4">
										{localComments.map((comment, idx) => {
											const hasUser = comment.user && typeof comment.user === 'object';
											return (
												<div key={comment._id || `comment-${idx}`} className="flex space-x-3">
													<div className="flex-shrink-0">
														{hasUser && comment.user.avatar ? (
															<img src={comment.user.avatar} alt={comment.user.username || 'User'} className="w-10 h-10 rounded-full" />
														) : (
															<div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
																<span className="text-white font-medium text-sm">{hasUser && comment.user.username ? comment.user.username.charAt(0).toUpperCase() : '?'}</span>
															</div>
														)}
													</div>
													<div className="flex-grow">
														<div className="flex items-center space-x-2 mb-1">
															<span className="font-semibold text-gray-900 dark:text-white">{hasUser && comment.user.username ? comment.user.username : 'Unknown'}</span>
															<span className="text-gray-500 dark:text-gray-400 text-sm">{new Date(comment.createdAt).toLocaleDateString()}</span>
														</div>
														<p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
														{user && (
															<button
																className="text-purple-600 dark:text-purple-400 text-xs mt-1 hover:underline"
																onClick={() => setReplyingTo(comment._id)}
															>Reply</button>
														)}
														{/* Reply form for this comment */}
														{replyingTo === comment._id && user && (
															<form onSubmit={(e) => handleReplySubmit(comment._id, e)} className="mt-2">
																<textarea
																	value={replyText}
																	onChange={(e) => setReplyText(e.target.value)}
																	placeholder={`Reply to ${hasUser && comment.user.username ? comment.user.username : 'this user'}...`}
																	className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs resize-none"
																	rows={2}
																/>
																<div className="flex justify-end mt-1">
																	<button
																		type="submit"
																		disabled={!replyText.trim() || submittingReply}
																		className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1 rounded text-xs font-semibold"
																	>
																		{submittingReply ? 'Posting...' : 'Reply'}
																	</button>
																</div>
															</form>
														)}
														{/* Render replies */}
														{comment.replies && comment.replies.length > 0 && renderReplies(comment.replies, comment._id)}
													</div>
												</div>
											);
										})}
				{comments.length === 0 && (
					<p className="text-gray-500 dark:text-gray-400 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
				)}
			</div>
		</div>
	);
};

export default Comments;
