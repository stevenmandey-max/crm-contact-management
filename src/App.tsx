import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { localStorageService } from './services/localStorage';
import { serviceSessionStorage } from './services/serviceSessionStorage';
import './App.css';

// Main App component with AuthProvider
function App() {
  // Initialize storage and recovery system when app starts
  useEffect(() => {
    localStorageService.initializeStorage();
    
    // Initialize service session recovery system
    serviceSessionStorage.initializeRecovery();
    
    console.log('CRM Application initialized with recovery system');
  }, []);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
