import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/current-user');
      if (response.data?.success) {
        setUser(response.data.data);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    // Listen to session expiry events from our Axios interceptor
    const handleAuthExpired = () => {
      setUser(null);
      setError('Session expired. Please log in again.');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      // Backend expects: { username, email, password }
      // We check if username looks like an email and pass the appropriate field
      const isEmail = username.includes('@');
      const payload = isEmail 
        ? { email: username, password } 
        : { username, password };

      const response = await api.post('/users/login', payload);
      if (response.data?.success) {
        setUser(response.data.data.user);
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (formData) => {
    try {
      setError(null);
      // Registration requires Multipart FormData for files
      const response = await api.post('/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please fill all fields correctly.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (fullname, email) => {
    try {
      const response = await api.patch('/users/update-account', { fullname, email });
      if (response.data?.success) {
        setUser(response.data.data);
        return { success: true };
      }
      return { success: false, error: 'Update failed' };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update profile details.';
      return { success: false, error: errMsg };
    }
  };

  const updateAvatar = async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const response = await api.patch('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Response includes the new url
      const newAvatarUrl = response.data?.url;
      if (newAvatarUrl) {
        setUser(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
        return { success: true, url: newAvatarUrl };
      }
      return { success: false, error: 'Failed to update avatar' };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update avatar.';
      return { success: false, error: errMsg };
    }
  };

  const updateCoverImage = async (coverimageFile) => {
    try {
      const formData = new FormData();
      formData.append('coverimage', coverimageFile);
      const response = await api.patch('/users/coverimage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const newCoverUrl = response.data?.url;
      if (newCoverUrl) {
        setUser(prev => prev ? { ...prev, coverimage: newCoverUrl } : null);
        return { success: true, url: newCoverUrl };
      }
      return { success: false, error: 'Failed to update cover image' };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to update cover image.';
      return { success: false, error: errMsg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        updateCoverImage,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
