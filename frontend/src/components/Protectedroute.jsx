import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';


export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'auth' | 'unauth'

  useEffect(() => {
    const verify = async () => {
      try {
        // hit any protected endpoint — if cookies are valid, it returns 200
        await axios.get(`${import.meta.env.VITE_BACKEND_PATH}/auth/me`, { withCredentials: true });
        setStatus('auth');
      } catch {
        setStatus('unauth');
      }
    };
    verify();
  }, []);

  if (status === 'checking') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{
          width: '36px', height: '36px',
          border: '2px solid var(--border)',
          borderTop: '2px solid var(--blue)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (status === 'unauth') {
    return <Navigate to="/" replace />;
  }

  return children;
}