import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import VideoCard from '../components/VideoCard';

export default function LikedVideos() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedVideos = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get('/like/videos');
      
      if (response.data?.success) {
        // Backend returns: [ { video: { ... } }, ... ]
        // Map to get the actual video objects
        const likedList = response.data.data.map(item => item.video).filter(Boolean);
        setVideos(likedList);
      }
    } catch (err) {
      console.error('Error fetching liked videos:', err);
      showToast('Could not load liked videos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedVideos();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Liked Videos</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Videos you've liked across PlayTube.
        </p>
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
          <Heart size={40} style={{ color: 'var(--accent-red)' }} />
          <h3>No Liked Videos</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
            Videos you like will appear here. Start exploring the platform to find and like videos you enjoy!
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Feed
          </Link>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
