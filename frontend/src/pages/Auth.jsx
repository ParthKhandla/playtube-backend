import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, Image as ImageIcon, User, Mail, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Auth() {
  const { login, register, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode state: login vs register
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  
  // File Fields
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    // Listen to query parameters: e.g. /auth?signup=true
    const isSignupQuery = searchParams.get('signup') === 'true';
    setIsSignUp(isSignupQuery);
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already logged in
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Validation
        if (!username || !email || !fullname || !password) {
          showToast('All text fields are required', 'error');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('username', username.trim().toLowerCase());
        formData.append('email', email.trim().toLowerCase());
        formData.append('fullname', fullname.trim());
        formData.append('password', password);
        
        if (avatarFile) {
          formData.append('avatar', avatarFile);
        }
        if (coverFile) {
          formData.append('coverimage', coverFile);
        }

        const result = await register(formData);
        if (result.success) {
          showToast('Account registered successfully! Logging in...', 'success');
          // Automatically log in after registration
          const loginResult = await login(username, password);
          if (loginResult.success) {
            navigate('/');
          }
        } else {
          showToast(result.error || 'Registration failed', 'error');
        }
      } else {
        // Login
        if (!username || !password) {
          showToast('Please enter both username/email and password', 'error');
          setLoading(false);
          return;
        }

        const result = await login(username.trim(), password);
        if (result.success) {
          showToast('Logged in successfully!', 'success');
          navigate('/');
        } else {
          showToast(result.error || 'Invalid credentials', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-title">
            Play<span className="text-gradient">Tube</span>
          </h1>
          <p className="auth-subtitle">
            {isSignUp ? 'Create your creator account' : 'Welcome back! Sign in to stream'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {isSignUp && (
            <>
              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" htmlFor="fullname">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="fullname"
                    type="text"
                    className="form-control"
                    placeholder="John Doe"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* Email */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" htmlFor="email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </>
          )}

          {/* Username / Account handle */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" htmlFor="username">
              {isSignUp ? 'Username (Handle)' : 'Username or Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder={isSignUp ? 'johndoe' : 'johndoe or email'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {isSignUp && (
            <>
              {/* Profile Image Selectors */}
              <div style={{ display: 'flex', gap: '16px', margin: '8px 0 16px' }}>
                {/* Avatar upload */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Avatar</span>
                  <label 
                    style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '50%', 
                      border: '2px dashed var(--border-color)', 
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </label>
                </div>

                {/* Cover Image upload */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 2 }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Channel Banner</span>
                  <label 
                    style={{ 
                      width: '100%', 
                      height: '64px', 
                      borderRadius: 'var(--border-radius-sm)', 
                      border: '2px dashed var(--border-color)', 
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ImageIcon size={14} /> Upload Banner
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : isSignUp ? (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => setIsSignUp(false)} 
                className="auth-link" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button 
                onClick={() => setIsSignUp(true)} 
                className="auth-link" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
