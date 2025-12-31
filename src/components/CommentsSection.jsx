import React, { useEffect, useState, useMemo } from "react";
import { addComment, addReply, getCommentsByPost, updateCommentApi, deleteCommentApi } from "../api/comments";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Send, ChevronDown, ChevronRight, MoreVertical, Edit2, Trash2, X, Check } from "lucide-react";
import { useAuth } from "../authContext/UserContext";

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label}`;
  }
  return "just now";
}

const Comment = ({ comment, allComments, onReply, onEdit, onDelete, level = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.text);
  const [showOptions, setShowOptions] = useState(false);
  const { user: currentUser } = useAuth();

  const isOwner = currentUser?._id === comment.user?._id;

  const replies = useMemo(() => 
    allComments.filter(c => c.parentId === comment._id),
    [allComments, comment._id]
  );

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty");
    await onReply(comment._id, replyText);
    setReplyText("");
    setShowReplyInput(false);
  };

  const handleEditSubmit = async () => {
    if (!editValue.trim()) return toast.error("Comment cannot be empty");
    await onEdit(comment._id, editValue);
    setIsEditing(false);
  };

  return (
    <div className={`mt-2 ${level > 0 ? "ml-6 border-l-2 border-gray-100 pl-4" : ""}`}>
      <div className="flex gap-2 group/main">
        <Link to={`/user/${comment.user?._id}`}>
          <img
            className="h-8 w-8 rounded-full object-cover hover:scale-105 transition-transform"
            src={comment.user?.avatar || "/avatar.png"}
            alt={comment.user?.name}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 p-3 rounded-2xl group-hover/main:bg-gray-100 transition-colors relative">
            <div className="flex items-center justify-between gap-2">
              <Link to={`/user/${comment.user?._id}`} className="hover:text-primary transition-colors truncate">
                <span className="text-sm font-black text-gray-900 truncate">
                  {comment.user?.name}
                </span>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-gray-400 font-bold text-[9px] uppercase tracking-tighter">
                    {timeSince(comment.createdAt)}
                </span>
                
                {isOwner && !isEditing && (
                    <div className="relative">
                        <button 
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-1 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-gray-600"
                        >
                            <MoreVertical size={14} />
                        </button>
                        
                        {showOptions && (
                            <div className="absolute right-0 top-full mt-1 bg-white shadow-xl rounded-xl border border-gray-100 py-1.5 z-50 min-w-[100px] animate-in fade-in zoom-in-95">
                                <button 
                                    onClick={() => { setIsEditing(true); setShowOptions(false); }}
                                    className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-gray-600 hover:bg-primary/5 hover:text-primary flex items-center gap-2"
                                >
                                    <Edit2 size={12} /> Edit
                                </button>
                                <button 
                                    onClick={() => { onDelete(comment._id); setShowOptions(false); }}
                                    className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
              </div>
            </div>

            {isEditing ? (
                <div className="mt-2 space-y-2">
                    <textarea 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[60px] font-medium"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all"
                        >
                            <X size={14} />
                        </button>
                        <button 
                            onClick={handleEditSubmit}
                            className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <Check size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-800 mt-1 leading-relaxed break-words font-medium">{comment.text}</p>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 ml-2">
            {!isEditing && (
                <button
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                onClick={() => setShowReplyInput(!showReplyInput)}
                >
                Reply
                </button>
            )}
            {replies.length > 0 && (
              <button
                className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {showReplyInput && (
            <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
              <input
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                type="text"
                placeholder={`Reply to ${comment.user?.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleReplySubmit()}
                autoFocus
              />
              <button
                onClick={handleReplySubmit}
                className="bg-primary text-white p-1.5 rounded-full hover:bg-primary-dark transition-transform active:scale-95"
              >
                <Send size={16} />
              </button>
            </div>
          )}

          {isExpanded && replies.length > 0 && (
            <div className="space-y-1">
              {replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  allComments={allComments}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function CommentsSection({
  postId,
  showComments,
  commentsCount,
  onCountChange,
}) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await getCommentsByPost(postId);
      setComments(data);
      setCommentsLoaded(true);
      if (onCountChange) onCountChange(data.length);
    } catch (error) {
      toast.error("Failed to load comments");
      console.error(error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments && !commentsLoaded) loadComments();
  }, [showComments, commentsLoaded]);

  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text) return toast.error("Comment cannot be empty");

    try {
      const newComment = await addComment(postId, text);
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      toast.success("Comment added successfully");
      if (onCountChange) onCountChange(commentsCount + 1);
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    }
  };

  const handleAddReply = async (commentId, text) => {
    try {
      const newReply = await addReply(commentId, text, postId);
      setComments((prev) => [...prev, newReply]);
      toast.success("Reply added");
      if (onCountChange) onCountChange(commentsCount + 1);
    } catch (error) {
      toast.error("Failed to add reply");
      console.error(error);
    }
  };

  const handleEditComment = async (commentId, text) => {
    try {
      const updated = await updateCommentApi(commentId, text);
      setComments((prev) => prev.map(c => c._id === commentId ? updated : c));
      toast.success("Comment updated");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteCommentApi(commentId);
      // Remove the comment and its replies from local state
      setComments((prev) => prev.filter(c => c._id !== commentId && c.parentId !== commentId));
      toast.success("Comment deleted");
      if (onCountChange) {
         // This is a simple approximation, accurate count would need refetch or checking children
         onCountChange(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const rootComments = useMemo(() => 
    comments.filter(c => !c.parentId),
    [comments]
  );

  if (!showComments) return null;

  return (
    <div className="mt-4 space-y-6">
      {/* Add Comment Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          className="bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-all active:scale-90"
        >
          <Send size={20} />
        </button>
      </div>

      {/* Comments List */}
      {loadingComments ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-t-primary border-2 border-gray-300 animate-spin rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {rootComments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4 italic">No comments yet. Be the first to comment!</p>
          ) : (
            rootComments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                allComments={comments}
                onReply={handleAddReply}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
