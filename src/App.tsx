import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/login';
import SignupPage from '@/pages/auth/signup';
import { Header } from '@/components/layout/Header';
import DashboardLayout from '@/components/layout/DashboardLayout';

function App() {
  const path = window.location.pathname;
  const showHeader = !path.startsWith('/login') && !path.startsWith('/signup');

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/newton-ai-agent" element={<DashboardLayout />} />
        <Route path="/analytics" element={<DashboardLayout />} />
        <Route path="/preview" element={<DashboardLayout />} />
        <Route path="/" element={<Navigate to="/newton-ai-agent" replace />} />
        <Route path="*" element={<Navigate to="/newton-ai-agent" replace />} />
      </Routes>
    </div>
  );
}

export default App;