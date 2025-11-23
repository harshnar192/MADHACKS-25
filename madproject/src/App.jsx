import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import InsightsPage from './pages/InsightsPage';
import CheckInPage from './pages/CheckInPage';
import SummaryPage from './pages/SummaryPage';
import VoicePage from './pages/VoicePage';
import GoalsPage from './pages/GoalsPage';
import TransactionsPage from './pages/TransactionsPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TopNavMenu from './components/TopNavMenu';
import BottomTabNav from './components/BottomTabNav';
import './App.css';

// Protected Route Component - Allows both authenticated and guest users
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="app-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p className="muted-text">Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="app-wrapper">
      <TopNavMenu />
      
      <main className="app-main">
        {children}
      </main>

      <BottomTabNav />
    </div>
  );
}

// Public Route Component (redirects to home if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Main App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Auth Pages - Public, no navigation */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        } 
      />
      
      {/* Main App Pages - Protected, with navigation */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <InsightsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/check-in" 
        element={
          <ProtectedRoute>
            <CheckInPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/summary" 
        element={
          <ProtectedRoute>
            <SummaryPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/voice" 
        element={
          <ProtectedRoute>
            <VoicePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/goals" 
        element={
          <ProtectedRoute>
            <GoalsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/about" 
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
