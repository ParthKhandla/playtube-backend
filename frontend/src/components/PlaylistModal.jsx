import React, { useState, useEffect } from 'react';
import { X, Plus, Check, FolderHeart, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PlaylistModal({ isOpen, onClose, videoId }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUserPlaylists = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const response = await api.get(`/playlist/user/${user._id}`);
      if (response.data?.success) {
        setPlaylists(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch user playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchUserPlaylists();
      setShowCreateForm(false);
      setName('');
      setDescription('');
    }
  }, [isOpen, user?._id]);

  if (!isOpen) return null;

  const isVideoInPlaylist = (playlist) => {
    if (!playlist?.videos) return false;
    return playlist.videos.some((v) => (v?._id || v) === videoId);
  };

  const handleToggle = async (playlist) => {
    const inPlaylist = isVideoInPlaylist(playlist);
    try {
      if (inPlaylist) {
        await api.patch(`/playlist/remove/${videoId}/${playlist._id}`);
        showToast(`Removed from ${playlist.name}`, 'info');
      } else {
        await api.patch(`/playlist/add/${videoId}/${playlist._id}`);
        showToast(`Added to ${playlist.name}`, 'success');
      }
      fetchUserPlaylists();
    } catch (err) {
      showToast('Failed to update playlist', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Playlist name is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const createRes = await api.post('/playlist', {
        name: name.trim(),
        description: description.trim(),
      });

      if (createRes.data?.success) {
        const newPlaylist = createRes.data.data;
        if (videoId && newPlaylist?._id) {
          await api.patch(`/playlist/add/${videoId}/${newPlaylist._id}`);
        }
        showToast(`Created playlist "${name.trim()}"`, 'success');
        setName('');
        setDescription('');
        setShowCreateForm(false);
        fetchUserPlaylists();
      }
    } catch (err) {
      showToast('Failed to create playlist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderHeart size={20} style={{ color: 'var(--accent-purple)' }} />
            Save video to...
          </h2>
          <button onClick={onClose} className="btn-icon" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Existing Playlists */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent-purple)' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
            {playlists.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>
                No playlists yet. Create one below!
              </p>
            ) : (
              playlists.map((playlist) => {
                const inList = isVideoInPlaylist(playlist);
                return (
                  <button
                    key={playlist._id}
                    onClick={() => handleToggle(playlist)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: inList ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-tertiary)',
                      border: inList ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{playlist.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {playlist.videos?.length || 0} videos
                      </div>
                    </div>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '4px',
                        border: inList ? 'none' : '2px solid var(--text-muted)',
                        backgroundColor: inList ? 'var(--accent-purple)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                      }}
                    >
                      {inList && <Check size={16} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Create Playlist Section */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
          >
            <Plus size={16} /> Create new playlist
          </button>
        ) : (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Playlist name..."
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={100}
            />
            <textarea
              placeholder="Description (optional)..."
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting || !name.trim()}>
                {submitting ? 'Creating...' : 'Create & Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
