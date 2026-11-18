import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';

// Pages
import Home from './pages/Home';
import VideoDetail from './pages/VideoDetail';
import Channel from './pages/Channel';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import LikedVideos from './pages/LikedVideos';
import History from './pages/History';

function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const isAuthPage = location.pathname === '/auth';

  // Helper component to enforce authentication
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return children;
  };

  return (
    <div className="app-container">
      {!isAuthPage && (
        <Navbar 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
          onOpenUpload={() => setUploadOpen(true)} 
        />
      )}
      
      <div className="main-layout" style={{ paddingTop: isAuthPage ? '0px' : '70px', height: isAuthPage ? '100vh' : 'calc(100vh - 70px)' }}>
        {!isAuthPage && <Sidebar collapsed={sidebarCollapsed} />}
        
        <main className="content-area" style={{ padding: isAuthPage ? '0px' : '24px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/watch/:videoId" element={<ProtectedRoute><VideoDetail /></ProtectedRoute>} />
            <Route path="/c/:username" element={<ProtectedRoute><Channel /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/liked-videos" element={<ProtectedRoute><LikedVideos /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {!isAuthPage && (
        <UploadModal 
          isOpen={uploadOpen} 
          onClose={() => setUploadOpen(false)} 
          onUploadSuccess={() => {
            // Trigger refresh if needed, pages hook up to context changes
            window.dispatchEvent(new Event('refresh-video-list'));
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
