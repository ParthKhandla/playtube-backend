import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import VideoCard from '../components/VideoCard';

export default function Subscriptions() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionsFeed = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch channels user is subscribed to
      const channelsResponse = await api.get(`/subscribe/c/${user._id}`);
      if (channelsResponse.data?.success) {
        const subsList = channelsResponse.data.data || [];
        // Map to get the channel objects
        const activeChannels = subsList.map(s => s.channel).filter(Boolean);
        setChannels(activeChannels);

        if (activeChannels.length > 0) {
          // 2. Fetch all videos
          const videosResponse = await api.get('/videos', {
            params: { limit: 50 },
          });

          if (videosResponse.data?.success) {
            const allVideos = videosResponse.data.data.docs || [];
            
            // 3. Filter videos uploaded by subscribed channels
            const subChannelIds = new Set(activeChannels.map(c => c._id));
            const filtered = allVideos.filter(v => subChannelIds.has(v.owner?._id || v.owner));
            
            setVideos(filtered);
          }
        } else {
          setVideos([]);
        }
      }
    } catch (err) {
      console.error('Error fetching subscriptions feed:', err);
      showToast('Could not load subscriptions feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionsFeed();
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Subscriptions</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Latest videos from the channels you follow.
        </p>
      </div>

      {channels.length === 0 ? (
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
          <Compass size={40} style={{ color: 'var(--accent-purple)' }} />
          <h3>No Subscriptions Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
            You haven't subscribed to any channels yet. Explore the Home page to discover creators and subscribe to their channels.
          </p>
          <Link to="/" className="btn btn-primary">
            Explore Videos
          </Link>
        </div>
      ) : (
        <>
          {/* Subscribed channels top list */}
          <div 
            style={{ 
              display: 'flex', 
              gap: '16px', 
              overflowX: 'auto', 
              paddingBottom: '16px', 
              borderBottom: '1px solid var(--border-color)' 
            }}
          >
            {channels.map((channel) => (
              <Link 
                key={channel._id} 
                to={`/c/${channel.username}`}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '8px', 
                  textDecoration: 'none',
                  flexShrink: 0,
                  width: '90px'
                }}
              >
                <img 
                  src={channel.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                  alt={channel.fullname} 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                />
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-primary)', 
                    fontWeight: 500, 
                    textAlign: 'center',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {channel.fullname}
                </span>
              </Link>
            ))}
          </div>

          {/* Subscriptions video feed */}
          <div>
            {videos.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No new videos from your subscriptions recently.</p>
              </div>
            ) : (
              <div className="video-grid">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
