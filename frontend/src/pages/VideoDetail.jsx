import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Send, Trash2, Edit2, Check, X, ShieldAlert, FolderPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { formatViews, formatTimeAgo } from '../utils/format';
import VideoCard from '../components/VideoCard';
import PlaylistModal from '../components/PlaylistModal';

export default function VideoDetail() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Video State
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);

  // Like & Subscription States
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Playlist State
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);

  // Track recorded views per videoId to prevent duplicate view increments
  const recordedViewRef = useRef(null);

  // Comments States
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  // Editing comments
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch main video data
      const videoResponse = await api.get(`/videos/v/${videoId}`);
      if (videoResponse.data?.success) {
        const videoData = videoResponse.data.data;
        setVideo(videoData);

        // Fetch creator dashboard or subscription status if owner is fetched
        if (videoData.owner?._id) {
          fetchSubscriptionStatus(videoData.owner._id);
        }
      }
      
      // Fetch Likes Count
      const likesCountResponse = await api.get(`/like/count/v/${videoId}`);
      if (likesCountResponse.data?.success) {
        setLikesCount(likesCountResponse.data.data.likesCount);
      }

      // Check if current user liked this video
      const likedResponse = await api.get(`/like/check/v/${videoId}`);
      if (likedResponse.data?.success) {
        const liked = Boolean(likedResponse.data.data?.isLiked ?? likedResponse.data.data?.liked);
        setIsLiked(liked);
      }

    } catch (err) {
      console.error('Error fetching video detail:', err);
      setError('Failed to load video details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async (channelId) => {
    try {
      // Check if subscribed
      const response = await api.get(`/subscribe/check/${channelId}`);
      if (response.data?.success) {
        setIsSubscribed(response.data.data.isSubscribed);
      }
      
      // Fetch channel details to get subscriber count
      const channelResponse = await api.get(`/users/c/${video?.owner?.username || user?.username}`);
      if (channelResponse.data?.success) {
        setSubscribersCount(channelResponse.data.data.subscribersCount);
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await api.get(`/comment/${videoId}`);
      if (response.data?.success) {
        // Comments are returned in a 'comments' array by the paginate response
        setComments(response.data.data.comments || response.data.data.docs || response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/videos', {
        params: { limit: 6 },
      });
      if (response.data?.success) {
        const allVideos = response.data.data.docs || [];
        // Filter out current video
        setRecommendations(allVideos.filter((v) => v._id !== videoId));
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  // Increment view count and record watch history exactly once per video session
  useEffect(() => {
    if (videoId && recordedViewRef.current !== videoId) {
      recordedViewRef.current = videoId;
      api.patch(`/videos/v/${videoId}`)
        .then((res) => {
          if (res.data?.data?.views !== undefined) {
            setVideo((prev) => (prev ? { ...prev, views: res.data.data.views } : prev));
          }
        })
        .catch(() => {});
      api.post('/users/addVideoToWatchHistory', { videoId }).catch(() => {});
    }
  }, [videoId]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVideoDetails();
    fetchComments();
    fetchRecommendations();
  }, [videoId, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      showToast('Please log in to like this video', 'info');
      return;
    }
    if (likeLoading) return;

    try {
      setLikeLoading(true);
      const response = await api.post(`/like/toggle/v/${videoId}`);
      if (response.data?.success) {
        const newIsLiked = Boolean(response.data.data?.isLiked ?? response.data.data?.liked);
        setIsLiked(newIsLiked);
        setLikesCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));
        showToast(newIsLiked ? 'Video liked!' : 'Video unliked', 'success');
      }
    } catch (err) {
      showToast('Failed to toggle like status', 'error');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSubscribeToggle = async () => {
    if (video?.owner?._id === user?._id) {
      showToast('You cannot subscribe to your own channel!', 'info');
      return;
    }

    try {
      const response = await api.post(`/subscribe/c/${video.owner._id}`);
      if (response.data?.success) {
        const newSubState = Boolean(response.data.data?.isSubscribed ?? !isSubscribed);
        setIsSubscribed(newSubState);
        setSubscribersCount((prev) => (newSubState ? prev + 1 : Math.max(0, prev - 1)));
        showToast(newSubState ? 'Subscribed to channel!' : 'Unsubscribed', 'success');
      }
    } catch (err) {
      showToast('Failed to toggle subscription', 'error');
    }
  };

  // Comments logic
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/comment/${videoId}`, { content: newComment.trim() });
      if (response.data?.success) {
        setNewComment('');
        showToast('Comment posted', 'success');
        fetchComments();
      }
    } catch (err) {
      showToast('Failed to post comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await api.delete(`/comment/c/${commentId}`);
      if (response.data?.success) {
        showToast('Comment deleted', 'success');
        setComments(comments.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      showToast('Failed to delete comment', 'error');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingCommentText.trim()) return;

    try {
      const response = await api.patch(`/comment/c/${commentId}`, { content: editingCommentText.trim() });
      if (response.data?.success) {
        showToast('Comment updated', 'success');
        setEditingCommentId(null);
        setEditingCommentText('');
        fetchComments();
      }
    } catch (err) {
      showToast('Failed to update comment', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--border-radius-lg)' }} />
          <div className="skeleton" style={{ width: '60%', height: '28px' }} />
          <div className="skeleton" style={{ width: '30%', height: '20px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '100%', height: '180px', borderRadius: 'var(--border-radius-md)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderLeft: '4px solid var(--accent-red)' }}>
        <ShieldAlert size={40} style={{ color: 'var(--accent-red)', marginBottom: '16px' }} />
        <h3>Failed to Load Video</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'The requested video was not found.'}</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', textAlign: 'left' }}>
      
      {/* Responsive columns for large displays */}
      <div style={{ display: 'flex', flexDirection: 'column', lgDirection: 'row', gap: '24px' }} className="video-detail-layout">
        
        {/* Main video area */}
        <div style={{ flex: '1 1 65%', minWidth: 0 }}>
          <div className="video-player-container">
            <video
              key={video.videoFile}
              controls
              playsInline
              className="video-element"
              poster={video.thumbnail}
            >
              <source src={video.videoFile.replace(/\.[^/.]+$/, ".webm")} type="video/webm" />
              <source src={video.videoFile} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, marginTop: '20px', marginBottom: '8px', lineHeight: 1.3 }}>
            {video.title}
          </h1>

          {/* Views, Likes, Share */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span>{formatViews(video.views)}</span>
              <span style={{ margin: '0 8px' }}>•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleLikeToggle} 
                disabled={likeLoading}
                className={`btn ${isLiked ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem' }}
              >
                <ThumbsUp size={16} />
                <span>{likesCount} Likes</span>
              </button>

              <button 
                onClick={() => {
                  if (!user) {
                    showToast('Please log in to save to playlists', 'info');
                    return;
                  }
                  setPlaylistModalOpen(true);
                }} 
                className="btn btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                title="Save video to playlist"
              >
                <FolderPlus size={16} />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Channel Info & Subscribe */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '16px' }}>
            {video.owner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to={`/c/${video.owner.username}`}>
                  <img
                    src={video.owner.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                    alt={video.owner.fullname}
                    className="video-card-avatar"
                    style={{ width: '48px', height: '48px' }}
                  />
                </Link>
                <div>
                  <Link 
                    to={`/c/${video.owner.username}`} 
                    style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                  >
                    {video.owner.fullname}
                  </Link>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    @{video.owner.username} • {subscribersCount} subscribers
                  </p>
                </div>
              </div>
            )}

            {video.owner?._id !== user?._id && (
              <button
                onClick={handleSubscribeToggle}
                className={`btn ${isSubscribed ? 'btn-secondary' : 'btn-primary'}`}
                style={{ borderRadius: '20px', padding: '8px 20px', fontSize: '0.85rem' }}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          {/* Description */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '16px', 
              backgroundColor: 'var(--bg-tertiary)', 
              borderRadius: 'var(--border-radius-md)',
              margin: '20px 0',
              fontSize: '0.925rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>Description</p>
            <p style={{ color: 'var(--text-secondary)' }}>{video.description || 'No description provided.'}</p>
          </div>

          {/* Comments Section */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} />
              Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <img
                src={user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt={user.fullname}
                className="video-card-avatar"
              />
              <div style={{ flexGrow: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Add a public comment..."
                  className="form-control"
                  style={{ paddingRight: '48px', borderRadius: '20px' }}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="btn-icon" 
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-purple)' }}
                  disabled={!newComment.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="skeleton" style={{ width: '100%', height: '80px', margin: '8px 0' }} />
            ) : comments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '16px 0' }}>No comments yet. Start the conversation!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {comments.map((comment) => {
                  const commentOwner = comment.ownerDetails || comment.owner;
                  const isCommentOwner = commentOwner?._id === user?._id || commentOwner === user?._id;
                  
                  return (
                    <div key={comment._id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <img
                        src={commentOwner?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                        alt={commentOwner?.fullname || 'User'}
                        className="video-card-avatar"
                      />
                      
                      <div style={{ flexGrow: 1, fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600 }}>{commentOwner?.fullname || 'Anonymous'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTimeAgo(comment.createdAt)}</span>
                        </div>

                        {editingCommentId === comment._id ? (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input
                              type="text"
                              className="form-control"
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                            />
                            <button onClick={() => handleEditComment(comment._id)} className="btn btn-primary" style={{ padding: '6px 12px' }}>
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingCommentId(null)} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                            {comment.content}
                          </p>
                        )}
                      </div>

                      {isCommentOwner && editingCommentId !== comment._id && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditingCommentText(comment.content);
                            }}
                            className="btn-icon"
                            style={{ width: '28px', height: '28px' }}
                            title="Edit Comment"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="btn-icon"
                            style={{ width: '28px', height: '28px', color: 'var(--accent-red)' }}
                            title="Delete Comment"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Recommended videos */}
        <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Recommended Videos
          </h3>
          {recommendations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No other recommendations found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recommendations.map((recVideo) => (
                <div key={recVideo._id} style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}>
                  <Link to={`/watch/${recVideo._id}`} style={{ width: '130px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <img src={recVideo.thumbnail} alt={recVideo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Link>
                  <div style={{ minWidth: 0 }}>
                    <Link 
                      to={`/watch/${recVideo._id}`} 
                      style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 600, 
                        color: 'var(--text-primary)', 
                        textDecoration: 'none',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.35
                      }}
                    >
                      {recVideo.title}
                    </Link>
                    {recVideo.owner && (
                      <Link 
                        to={`/c/${recVideo.owner.username}`} 
                        style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'block', marginTop: '4px' }}
                      >
                        {recVideo.owner.fullname}
                      </Link>
                    )}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatViews(recVideo.views)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <PlaylistModal
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        videoId={videoId}
      />
    </div>
  );
}
