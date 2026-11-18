import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { formatViews } from '../utils/format';

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/users/history');
      const historyList = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.data) ? response.data.data : []);
      setVideos(historyList.filter(Boolean));
    } catch (err) {
      console.error('Error fetching watch history:', err);
      showToast('Could not load watch history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchWatchHistory();
    }
  }, [user, authLoading]);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire watch history?')) {
      return;
    }

    try {
      const response = await api.delete('/users/clear-history');
      if (response.data?.success || response.status === 200) {
        showToast('Watch history cleared successfully', 'success');
        setVideos([]);
      }
    } catch (err) {
      showToast('Failed to clear watch history', 'error');
    }
  };

  const handleRemoveItem = async (videoId) => {
    try {
      const response = await api.delete('/users/remove-from-history', {
        data: { videoId }
      });
      if (response.data?.success || response.status === 200) {
        showToast('Video removed from history', 'success');
        setVideos(prev => prev.filter(v => v._id !== videoId));
      }
    } catch (err) {
      showToast('Failed to remove video from history', 'error');
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="glass-card" 
        style={{ 
          padding: '60px 40px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginTop: '40px'
        }}
      >
        <HistoryIcon size={40} style={{ color: 'var(--accent-purple)' }} />
        <h3>Sign in to view your watch history</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Keep track of what you watch. Sign in to access your watch history across devices.
        </p>
        <Link to="/auth" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Watch History</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage the history of videos you have watched.
          </p>
        </div>
        {videos.length > 0 && (
          <button onClick={handleClearHistory} className="btn btn-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={16} /> Clear All History
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <div 
          className="glass-card" 
          style={{ 
            padding: '60px 40px', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <HistoryIcon size={40} style={{ color: 'var(--accent-purple)' }} />
          <h3>Watch History Empty</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
            Videos you watch will show up here. Go stream some videos from our feed!
          </p>
          <Link to="/" className="btn btn-primary">
            Stream Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {videos.map((video) => (
            <div 
              key={video._id} 
              style={{ 
                display: 'flex', 
                gap: '20px', 
                padding: '16px',
                position: 'relative'
              }}
              className="glass-card video-card"
            >
              <Link to={`/watch/${video._id}`} style={{ width: '220px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Link>

              <div style={{ flexGrow: 1, minWidth: 0, textAlign: 'left' }}>
                <Link 
                  to={`/watch/${video._id}`} 
                  style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}
                >
                  {video.title}
                </Link>
                {video.owner && (
                  <Link to={`/c/${video.owner.username}`} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>
                    {video.owner.fullname}
                  </Link>
                )}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatViews(video.views || 0)}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {video.description}
                </p>
              </div>

              <div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleRemoveItem(video._id);
                  }}
                  className="btn-icon remove-btn" 
                  title="Remove from history"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
