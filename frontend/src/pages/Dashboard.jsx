import React, { useState, useEffect } from 'react';
import { Play, Eye, ThumbsUp, Users, Plus, Edit2, Trash2, Globe, Shield, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { formatViews } from '../utils/format';
import UploadModal from '../components/UploadModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Editing state
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsResponse = await api.get('/dashboard/stats');
      if (statsResponse.data?.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch videos
      const videosResponse = await api.get('/dashboard/videos');
      if (videosResponse.data?.success) {
        setVideos(videosResponse.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleTogglePublish = async (videoId) => {
    try {
      const response = await api.patch(`/videos/uv/${videoId}/toggle-publish`);
      if (response.data?.success) {
        showToast('Publish status updated', 'success');
        // Update local state
        setVideos(prev => 
          prev.map(v => v._id === videoId ? { ...v, isPublished: !v.isPublished } : v)
        );
      }
    } catch (err) {
      showToast('Failed to update publish status', 'error');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/videos/uv/${videoId}`);
      if (response.data?.success) {
        showToast('Video deleted successfully', 'success');
        setVideos(prev => prev.filter(v => v._id !== videoId));
        // Refresh stats
        const statsResponse = await api.get('/dashboard/stats');
        if (statsResponse.data?.success) {
          setStats(statsResponse.data.data);
        }
      }
    } catch (err) {
      showToast('Failed to delete video', 'error');
    }
  };

  const handleEditClick = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description);
    setEditThumbnailPreview(video.thumbnail);
    setEditThumbnail(null);
  };

  const handleEditThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDescription.trim()) {
      showToast('Title and Description are required', 'error');
      return;
    }

    setSavingEdit(true);
    const formData = new FormData();
    formData.append('title', editTitle.trim());
    formData.append('description', editDescription.trim());
    if (editThumbnail) {
      formData.append('thumbnail', editThumbnail);
    }

    try {
      const response = await api.patch(`/videos/uv/${editingVideo._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        showToast('Video updated successfully', 'success');
        setEditingVideo(null);
        fetchDashboardData();
      }
    } catch (err) {
      showToast('Failed to update video details', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      
      {/* Title section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Creator Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Welcome back, {user?.fullname}! Manage your content and check channel analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchDashboardData} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setUploadOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Upload Video
          </button>
        </div>
      </div>

      {/* Stats Cards Widget Grid */}
      {stats && (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px' 
          }}
        >
          {/* Card 1: Subscribers */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Subscribers</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px' }}>{stats.totalSubscribers}</h3>
            </div>
          </div>

          {/* Card 2: Views */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent-blue)' }}>
              <Eye size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Views</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px' }}>{formatViews(stats.totalViews).split(' ')[0]}</h3>
            </div>
          </div>

          {/* Card 3: Likes */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)' }}>
              <ThumbsUp size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Likes</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px' }}>{stats.totalLikes}</h3>
            </div>
          </div>

          {/* Card 4: Videos */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Play size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Videos</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px' }}>{stats.totalVideos}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Videos List Table */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '20px' }}>Uploaded Videos</h3>
        
        {videos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p>You haven't uploaded any videos yet.</p>
            <button onClick={() => setUploadOpen(true)} className="btn btn-primary" style={{ marginTop: '16px' }}>
              Upload Your First Video
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Video</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Visibility</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Views</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date Uploaded</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  
                  {/* Video Title + Thumbnail */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <Link to={`/watch/${video._id}`} style={{ width: '90px', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Link>
                      <div style={{ minWidth: 0 }}>
                        <Link to={`/watch/${video._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                          {video.title}
                        </Link>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {video.description || 'No description'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Visibility Toggler */}
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => handleTogglePublish(video._id)}
                      className="btn"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        borderRadius: '12px',
                        backgroundColor: video.isPublished ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: video.isPublished ? '#10b981' : 'var(--accent-red)',
                        border: '1px solid transparent',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      title="Click to toggle privacy"
                    >
                      {video.isPublished ? (
                        <>
                          <Globe size={12} /> Public
                        </>
                      ) : (
                        <>
                          <Shield size={12} /> Private
                        </>
                      )}
                    </button>
                  </td>

                  {/* Views */}
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {video.views || 0}
                  </td>

                  {/* Date Uploaded */}
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {new Date(video.createdAt).toLocaleDateString()}
                  </td>

                  {/* Action buttons */}
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleEditClick(video)} 
                        className="btn btn-secondary" 
                        style={{ padding: '6px', borderRadius: '8px' }}
                        title="Edit details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteVideo(video._id)} 
                        className="btn btn-danger" 
                        style={{ padding: '6px', borderRadius: '8px' }}
                        title="Delete video"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Video Modal */}
      <UploadModal 
        isOpen={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        onUploadSuccess={fetchDashboardData} 
      />

      {/* Edit Video Details Modal */}
      {editingVideo && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Video Details</h2>
              <button onClick={() => setEditingVideo(null)} className="modal-close btn-icon" disabled={savingEdit}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-title">Title</label>
                <input
                  id="edit-title"
                  type="text"
                  className="form-control"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={savingEdit}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  className="form-control"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={savingEdit}
                  required
                  style={{ minHeight: '120px' }}
                />
              </div>

              <div className="form-group">
                <span className="form-label">Replace Thumbnail (Optional)</span>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="file" accept="image/*" onChange={handleEditThumbnailChange} style={{ display: 'none' }} disabled={savingEdit} />
                    Choose New Image
                  </label>
                  {editThumbnailPreview && (
                    <img 
                      src={editThumbnailPreview} 
                      alt="Thumbnail Preview" 
                      style={{ width: '120px', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setEditingVideo(null)} className="btn btn-secondary" disabled={savingEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
