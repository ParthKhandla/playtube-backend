import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Play, SlidersHorizontal, LogIn, Compass, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import VideoCard from '../components/VideoCard';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Sorting options
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortType, setSortType] = useState('desc');

  // Parse search query from URL: e.g. /?q=mysearch
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  const fetchVideos = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/videos', {
        params: {
          query: searchQuery,
          sortBy,
          sortType,
          published: 'true', // Only fetch published videos
        },
      });

      if (response.data?.success) {
        // aggregatePaginate returns result with docs
        setVideos(response.data.data.docs || []);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Could not load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [user, searchQuery, sortBy, sortType]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
      </div>
    );
  }

  // Landing Page for Unauthenticated Users
  if (!user) {
    return (
      <div 
        className="animate-fade-in"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '70vh', 
          textAlign: 'center',
          padding: '40px 20px'
        }}
      >
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            background: 'var(--accent-gradient)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <Play size={40} style={{ color: '#fff', marginLeft: '4px' }} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
          Welcome to Play<span className="text-gradient">Tube</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', lineHeight: 1.6, marginBottom: '32px' }}>
          A premium social media video sharing ecosystem. Watch video feeds, upload your own content, manage playlists, subscribe to channels, and interact via community tweets.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/auth" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: '30px' }}>
            <LogIn size={18} />
            Sign In Now
          </Link>
          <Link to="/auth?signup=true" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: '30px' }}>
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Feed header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700, textAlign: 'left' }}>
            {searchQuery ? `Search results for "${searchQuery}"` : 'Recommended Feed'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left', marginTop: '4px' }}>
            {videos.length} {videos.length === 1 ? 'video' : 'videos'} available
          </p>
        </div>

        {/* Sorting controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Sort by:</span>
          
          <select 
            className="form-control" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Upload Date</option>
            <option value="views">Most Viewed</option>
            <option value="title">Title (A-Z)</option>
          </select>

          <select 
            className="form-control" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="video-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--border-radius-md)' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ width: '90%', height: '16px' }} />
                  <div className="skeleton" style={{ width: '60%', height: '12px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div 
          className="glass-card" 
          style={{ 
            padding: '40px', 
            textAlign: 'center', 
            borderLeft: '4px solid var(--accent-red)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <ShieldAlert size={40} style={{ color: 'var(--accent-red)' }} />
          <h3>Database Connection or Server Error</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>{error}</p>
          <button onClick={fetchVideos} className="btn btn-secondary" style={{ marginTop: '12px' }}>
            Retry Loading
          </button>
        </div>
      ) : videos.length === 0 ? (
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
          <h3>No Videos Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
            {searchQuery 
              ? `We couldn't find any videos matching "${searchQuery}". Try using different terms.`
              : 'Be the first to publish a video! Get started by clicking the Upload button.'}
          </p>
          {searchQuery && (
            <Link to="/" className="btn btn-primary">
              Clear Search
            </Link>
          )}
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
