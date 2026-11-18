import React, { useState } from 'react';
import { X, UploadCloud, Film, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen) return null;

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      showToast('Please select a video file', 'error');
      return;
    }
    if (!thumbnailFile) {
      showToast('Please select a thumbnail image', 'error');
      return;
    }
    if (!title.trim() || !description.trim()) {
      showToast('Title and Description are required', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnailFile);
    formData.append('title', title.trim());
    formData.append('description', description.trim());

    try {
      setUploading(true);
      showToast('Uploading video and thumbnail...', 'info');

      const response = await api.post('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data?.success) {
        showToast('Video published successfully!', 'success');
        resetForm();
        onUploadSuccess?.();
        onClose();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to upload video';
      showToast(errMsg, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Publish a New Video</h2>
          <button onClick={onClose} className="modal-close btn-icon" disabled={uploading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Video Selection */}
          <div className="form-group">
            <span className="form-label">Video File</span>
            {!videoFile ? (
              <label className="drag-drop-area" style={{ display: 'block' }}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <UploadCloud className="drag-drop-icon" size={40} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select Video File</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>MP4, WebM or OGG files</p>
              </label>
            ) : (
              <div 
                style={{ 
                  padding: '16px', 
                  backgroundColor: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color-focus)', 
                  borderRadius: 'var(--border-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Film size={24} style={{ color: 'var(--accent-purple)' }} />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{videoFile.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={() => setVideoFile(null)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} disabled={uploading}>
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail Selection */}
          <div className="form-group">
            <span className="form-label">Thumbnail Image</span>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <label 
                className="drag-drop-area" 
                style={{ 
                  flex: 1, 
                  padding: '24px 12px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '130px'
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  style={{ display: 'none' }}
                />
                <ImageIcon className="drag-drop-icon" size={24} style={{ marginBottom: '8px' }} />
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Upload Thumbnail</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG or WEBP</p>
              </label>

              <div 
                style={{ 
                  width: '180px', 
                  aspectRatio: '16/9', 
                  borderRadius: 'var(--border-radius-md)', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--bg-tertiary)', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preview Image</p>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="form-group">
            <label className="form-label" htmlFor="video-title">Video Title</label>
            <input
              id="video-title"
              type="text"
              className="form-control"
              placeholder="Give your video a catchy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="video-desc">Description</label>
            <textarea
              id="video-desc"
              className="form-control"
              placeholder="Tell viewers what your video is about"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 500 }}>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${uploadProgress}%`, 
                    height: '100%', 
                    background: 'var(--accent-gradient)', 
                    transition: 'width 0.1s ease-out' 
                  }} 
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Please do not close this window or refresh the page.</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary" 
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={uploading}
            >
              {uploading ? 'Publishing...' : 'Publish'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
