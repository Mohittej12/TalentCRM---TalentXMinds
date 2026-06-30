import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SplashScreen from './components/SplashScreen';

// Animated page wrapper – re-mounts transition on route change
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className={`page-transition ${visible ? 'page-enter' : 'page-exit'}`}>
      {children}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      {splashDone && (
        <Router>
          <Routes>
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <PageTransition>
                    <Auth />
                  </PageTransition>
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={<Navigate to={localStorage.getItem('token') ? '/dashboard' : '/auth'} replace />}
            />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
