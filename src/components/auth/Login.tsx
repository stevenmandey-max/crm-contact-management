import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './Login.css';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Login must be used within an AuthProvider');
  }
  
  const { login, error, clearError, isLoading } = context;

  // Clear error when component mounts or inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [username, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await login(username.trim(), password);
      
      if (success) {
        onLoginSuccess?.();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    
    setIsSubmitting(true);
    
    try {
      const success = await login(demoUsername, demoPassword);
      
      if (success) {
        onLoginSuccess?.();
      }
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Hopeline Care</h1>
          <p>Contact Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              disabled={isSubmitting}
              required
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              disabled={isSubmitting}
              required
              autoComplete="current-password"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting || !username.trim() || !password.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="demo-section">
          <button
            type="button"
            className="demo-toggle"
            onClick={() => setShowCredentials(!showCredentials)}
          >
            {showCredentials ? 'Hide' : 'Show'} Demo Credentials
          </button>

          {showCredentials && (
            <div className="demo-credentials">
              <h3>Demo Accounts:</h3>
              
              <div className="demo-account">
                <div className="demo-info">
                  <strong>Administrator</strong>
                  <span>Username: admin | Password: admin123</span>
                  <small>Full access to all features</small>
                </div>
                <button
                  type="button"
                  className="demo-login-btn admin"
                  onClick={() => handleDemoLogin('admin', 'admin123')}
                  disabled={isSubmitting}
                >
                  Login as Admin
                </button>
              </div>

              <div className="demo-account">
                <div className="demo-info">
                  <strong>Editor</strong>
                  <span>Username: editor | Password: editor123</span>
                  <small>Can manage contacts and export data</small>
                </div>
                <button
                  type="button"
                  className="demo-login-btn editor"
                  onClick={() => handleDemoLogin('editor', 'editor123')}
                  disabled={isSubmitting}
                >
                  Login as Editor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};