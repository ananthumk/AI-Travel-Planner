import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        // Add token to API default header for this request
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          // Validate token by making a test request to protected endpoint
          await api.get('/auth/me');
          setUser(JSON.parse(storedUser));
        } catch (err) {
          // Token is invalid or expired
          console.log('Token validation failed:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const persistSession = (data) => {
    const { token, ...userData } = data; // backend returns { _id, name, email, token }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persistSession(data);
    navigate('/dashboard');
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
