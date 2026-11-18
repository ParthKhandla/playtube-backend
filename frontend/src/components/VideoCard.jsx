import React from 'react';
import { Link } from 'react-router-dom';
import { formatViews, formatDuration, formatTimeAgo } from '../utils/format';

export default function VideoCard({ video }) {
  if (!video) return null;

  const { _id, title, thumbnail, duration, views, createdAt, owner } = video;

  return (
    <div className="video-card animate-fade-in">
      <Link to={`/watch/${_id}`} className="video-card-thumbnail-wrapper">
        <img
          src={thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60'}
          alt={title}
          className="video-card-thumbnail"
          loading="lazy"
        />
        {duration && (
          <span className="video-card-duration">
            {formatDuration(duration)}
          </span>
        )}
      </Link>

      <div className="video-card-content">
        {owner && (
          <Link to={`/c/${owner.username}`}>
            <img
              src={owner.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt={owner.fullname}
              className="video-card-avatar"
            />
          </Link>
        )}

        <div className="video-card-info">
          <Link
            to={`/watch/${_id}`}
            className="video-card-title"
            title={title}
            style={{ textDecoration: 'none' }}
          >
            {title}
          </Link>

          {owner && (
            <Link to={`/c/${owner.username}`} className="video-card-channel">
              {owner.fullname}
            </Link>
          )}

          <div className="video-card-stats">
            <span>{formatViews(views)}</span>
            <span style={{ margin: '0 5px' }}>•</span>
            <span>{formatTimeAgo(createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
