import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Film, FolderHeart, MessageSquare, Info, Upload, Edit, Trash2, ShieldAlert, Heart, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { formatTimeAgo, formatViews } from '../utils/format';
import VideoCard from '../components/VideoCard';

export default function Channel() {
  const { username } = useParams();
  const { user: currentUser, updateAvatar, updateCoverImage, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Tab: 'videos', 'playlists', 'tweets', 'about'
  const [activeTab, setActiveTab] = useState('videos');

  // Tab content states
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [tweetsLoading, setTweetsLoading] = useState(false);

  // Subscription states
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Tweet Creation
  const [newTweet, setNewTweet] = useState('');
  const [tweetPosting, setTweetPosting] = useState(false);
  const [editingTweetId, setEditingTweetId] = useState(null);
  const [editingTweetText, setEditingTweetText] = useState('');

  // Editing Profile (Channel owner only)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullname, setEditFullname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const isOwner = currentUser?.username?.toLowerCase() === username?.toLowerCase();

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/users/c/${username}`);
      if (response.data?.success) {
        const channelData = response.data.data;
        setChannel(channelData);
        setSubscribersCount(channelData.subscribersCount || 0);
        setIsSubscribed(channelData.isSubscribed || false);

        setEditFullname(channelData.fullname);
        setEditEmail(channelData.email);

        // Fetch initial tab data
        fetchTabContent(activeTab, channelData._id);
      }
    } catch (err) {
      console.error('Error fetching channel data:', err);
      setError('Channel not found or database error.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabContent = async (tab, userId) => {
    const id = userId || channel?._id;
    if (!id) return;

    if (tab === 'videos') {
      try {
        setVideosLoading(true);
        // Fetch all videos from this owner
        const response = await api.get('/videos', {
          params: { userId: id, limit: 30 },
        });
        if (response.data?.success) {
          setVideos(response.data.data.docs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setVideosLoading(false);
      }
    } else if (tab === 'playlists') {
      try {
        setPlaylistsLoading(true);
        const response = await api.get(`/playlist/user/${id}`);
        if (response.data?.success) {
          setPlaylists(response.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPlaylistsLoading(false);
      }
    } else if (tab === 'tweets') {
      try {
        setTweetsLoading(true);
        const response = await api.get(`/tweets/user/${id}`);
        if (response.data?.success) {
          setTweets(response.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTweetsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchChannelData();
  }, [username]);

  // Refetch content when switching tabs
  useEffect(() => {
    if (channel) {
      fetchTabContent(activeTab);
    }
  }, [activeTab]);

  const handleSubscribeToggle = async () => {
    if (isOwner) {
      showToast('You cannot subscribe to yourself!', 'info');
      return;
    }
    try {
      const response = await api.post(`/subscribe/c/${channel._id}`);
      if (response.data?.success) {
        setIsSubscribed(!isSubscribed);
        setSubscribersCount((prev) => (isSubscribed ? prev - 1 : prev + 1));
        showToast(isSubscribed ? 'Unsubscribed' : 'Subscribed to channel!', 'success');
      }
    } catch (err) {
      showToast('Failed to toggle subscription', 'error');
    }
  };

  // Profile Image Updates
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast('Uploading avatar...', 'info');
      const result = await updateAvatar(file);
      if (result.success) {
        setChannel(prev => ({ ...prev, avatar: result.url }));
        showToast('Avatar updated successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to update avatar', 'error');
      }
    } catch (err) {
      showToast('Error uploading avatar', 'error');
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast('Uploading channel banner...', 'info');
      const result = await updateCoverImage(file);
      if (result.success) {
        setChannel(prev => ({ ...prev, coverimage: result.url }));
        showToast('Banner updated successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to update banner', 'error');
      }
    } catch (err) {
      showToast('Error uploading banner', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const result = await updateProfile(editFullname, editEmail);
      if (result.success) {
        setChannel(prev => ({ ...prev, fullname: editFullname, email: editEmail }));
        setIsEditingProfile(false);
        showToast('Profile details updated!', 'success');
      } else {
        showToast(result.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Error updating profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Tweets logic
  const handlePostTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim()) return;

    setTweetPosting(true);
    try {
      const response = await api.post('/tweets', { content: newTweet.trim() });
      if (response.data?.success) {
        setNewTweet('');
        showToast('Tweet shared with community', 'success');
        fetchTabContent('tweets');
      }
    } catch (err) {
      showToast('Failed to post tweet', 'error');
    } finally {
      setTweetPosting(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      const response = await api.delete(`/tweets/${tweetId}`);
      if (response.data?.success) {
        showToast('Tweet deleted', 'success');
        setTweets(tweets.filter((t) => t._id !== tweetId));
      }
    } catch (err) {
      showToast('Failed to delete tweet', 'error');
    }
  };

  const handleEditTweetSubmit = async (tweetId) => {
    if (!editingTweetText.trim()) return;

    try {
      const response = await api.patch(`/tweets/${tweetId}`, { content: editingTweetText.trim() });
      if (response.data?.success) {
        showToast('Tweet updated', 'success');
        setEditingTweetId(null);
        setEditingTweetText('');
        fetchTabContent('tweets');
      }
    } catch (err) {
      showToast('Failed to edit tweet', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: 'var(--border-radius-lg)' }} />
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
            <div className="skeleton" style={{ width: '200px', height: '24px' }} />
            <div className="skeleton" style={{ width: '150px', height: '16px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderLeft: '4px solid var(--accent-red)' }}>
        <ShieldAlert size={40} style={{ color: 'var(--accent-red)', marginBottom: '16px' }} />
        <h3>Channel Not Found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'This creator profile is unavailable.'}</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      
      {/* Banner / Cover Image */}
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '240px', 
          borderRadius: 'var(--border-radius-lg)', 
          overflow: 'hidden', 
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)'
        }}
      >
        <img 
          src={channel.coverimage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80'} 
          alt="Channel Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {isOwner && (
          <label 
            className="btn btn-secondary" 
            style={{ 
              position: 'absolute', 
              bottom: '16px', 
              right: '16px', 
              borderRadius: '20px', 
              padding: '6px 14px', 
              fontSize: '0.8rem',
              cursor: 'pointer' 
            }}
          >
            <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
            <Upload size={14} /> Update Banner
          </label>
        )}
      </div>

      {/* Profile Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', padding: '0 8px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <img 
              src={channel.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
              alt={channel.fullname} 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-primary)', boxShadow: 'var(--shadow-md)' }}
            />
            {isOwner && (
              <label 
                className="btn btn-primary btn-icon" 
                style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0, 
                  width: '32px', 
                  height: '32px',
                  cursor: 'pointer' 
                }}
              >
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                <Upload size={12} />
              </label>
            )}
          </div>

          <div>
            <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>{channel.fullname}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              @{channel.username} • {subscribersCount} subscribers • {channel.channelsSubscribedToCount || 0} subscribed
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {isOwner ? (
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)} 
              className="btn btn-secondary" 
              style={{ borderRadius: '20px', padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Edit size={16} /> Edit Profile
            </button>
          ) : (
            <button 
              onClick={handleSubscribeToggle} 
              className={`btn ${isSubscribed ? 'btn-secondary' : 'btn-primary'}`}
              style={{ borderRadius: '20px', padding: '8px 24px', fontSize: '0.85rem' }}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Editing Profile Form Modal (Simple Inline View) */}
      {isEditingProfile && (
        <div className="glass-card" style={{ padding: '24px', backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-purple)' }}>
          <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>Update Channel Details</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="edit-name">Display Name</label>
              <input 
                id="edit-name"
                type="text" 
                className="form-control" 
                value={editFullname} 
                onChange={(e) => setEditFullname(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="edit-email">Email Address</label>
              <input 
                id="edit-email"
                type="email" 
                className="form-control" 
                value={editEmail} 
                onChange={(e) => setEditEmail(e.target.value)} 
                required 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', gridColumn: 'span 2', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px' }} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigation Tabs */}
      <div 
        style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)', 
          gap: '24px',
          marginTop: '12px' 
        }}
      >
        {[
          { id: 'videos', label: 'Videos', icon: <Film size={16} /> },
          { id: 'playlists', label: 'Playlists', icon: <FolderHeart size={16} /> },
          { id: 'tweets', label: 'Community', icon: <MessageSquare size={16} /> },
          { id: 'about', label: 'About', icon: <Info size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 8px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-purple)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div style={{ minHeight: '30vh' }}>
        
        {/* Videos Tab */}
        {activeTab === 'videos' && (
          videosLoading ? (
            <div className="video-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: '16/9', borderRadius: '8px' }} />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No videos published by this creator yet.</p>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          playlistsLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No playlists created by this creator yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {playlists.map((playlist) => (
                <div 
                  key={playlist._id} 
                  className="video-card" 
                  style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <div style={{ height: '120px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderHeart size={40} style={{ color: 'var(--accent-purple)' }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{playlist.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {playlist.videos?.length || 0} videos
                  </p>
                </div>
              ))}
            </div>
          )
        )}

        {/* Tweets Tab */}
        {activeTab === 'tweets' && (
          <div style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Create Tweet Form */}
            {isOwner && (
              <form onSubmit={handlePostTweet} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  placeholder="Share what's on your mind with your subscribers..."
                  className="form-control"
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  style={{ minHeight: '80px' }}
                  disabled={tweetPosting}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} disabled={!newTweet.trim() || tweetPosting}>
                    {tweetPosting ? 'Posting...' : 'Post Tweet'}
                  </button>
                </div>
              </form>
            )}

            {/* Tweets List */}
            {tweetsLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading community tweets...</p>
            ) : tweets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No community updates from this channel yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tweets.map((tweet) => (
                  <div key={tweet._id} className="glass-card" style={{ padding: '20px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <img 
                        src={channel.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                        alt={channel.fullname} 
                        className="video-card-avatar"
                      />
                      
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{channel.fullname}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                              {formatTimeAgo(tweet.createdAt)}
                            </span>
                          </div>
                        </div>

                        {editingTweetId === tweet._id ? (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <input
                              type="text"
                              className="form-control"
                              value={editingTweetText}
                              onChange={(e) => setEditingTweetText(e.target.value)}
                            />
                            <button onClick={() => handleEditTweetSubmit(tweet._id)} className="btn btn-primary" style={{ padding: '6px 12px' }}>
                              Save
                            </button>
                            <button onClick={() => setEditingTweetId(null)} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                            {tweet.content}
                          </p>
                        )}
                      </div>

                      {isOwner && editingTweetId !== tweet._id && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => {
                              setEditingTweetId(tweet._id);
                              setEditingTweetText(tweet.content);
                            }}
                            className="btn-icon"
                            style={{ width: '28px', height: '28px' }}
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteTweet(tweet._id)}
                            className="btn-icon"
                            style={{ width: '28px', height: '28px', color: 'var(--accent-red)' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="glass-card" style={{ padding: '24px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Channel Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Email Handle</span>
                <span style={{ fontWeight: 500 }}>{channel.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subscriber Count</span>
                <span style={{ fontWeight: 500 }}>{subscribersCount} subscribers</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Joined On</span>
                <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  {new Date(channel.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
