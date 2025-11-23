import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import InsightsPage from './pages/InsightsPage';
import CheckInPage from './pages/CheckInPage';
import SummaryPage from './pages/SummaryPage';
import VoicePage from './pages/VoicePage';
import GoalsPage from './pages/GoalsPage';
import TransactionsPage from './pages/TransactionsPage';
import AboutPage from './pages/AboutPage';
import TopNavMenu from './components/TopNavMenu';
import BottomTabNav from './components/BottomTabNav';
import './App.css';

// Simple Layout Component with navigation
function AppLayout({ children }) {
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

// Main App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* All pages with navigation */}
      <Route 
        path="/" 
        element={
          <AppLayout>
            <InsightsPage />
          </AppLayout>
        } 
      />
      <Route 
        path="/check-in" 
        element={
          <AppLayout>
            <CheckInPage />
          </AppLayout>
        } 
      />
      <Route 
        path="/summary" 
        element={
          <AppLayout>
            <SummaryPage />
          </AppLayout>
        } 
      />
      <Route 
        path="/voice" 
        element={
          <AppLayout>
            <VoicePage />
          </AppLayout>
        } 
      />
      <Route 
        path="/goals" 
        element={
          <AppLayout>
            <GoalsPage />
          </AppLayout>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <AppLayout>
            <TransactionsPage />
          </AppLayout>
        } 
      />
      <Route 
        path="/about" 
        element={
          <AppLayout>
            <AboutPage />
          </AppLayout>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </DataProvider>
  );
}

export default App;
