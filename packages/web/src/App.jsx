import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrgsPage from './pages/OrgsPage';
import BoardsPage from './pages/BoardsPage';
import BoardPage from './pages/BoardPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/orgs"
              element={
                <PrivateRoute>
                  <OrgsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/orgs/:orgId/boards"
              element={
                <PrivateRoute>
                  <BoardsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/boards/:boardId"
              element={
                <PrivateRoute>
                  <BoardPage />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/orgs" />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
