import { AuthenticateWithRedirectCallback, useUser, useSession } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cursor from '../components/Cursor';

function SyncUser() {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !user || !session) return;

    const syncWithBackend = async () => {
      try {
        const token = await session.getToken();
        // Send Clerk session token to backend — backend verifies + creates/logs in user
        await axios.post(`${import.meta.env.VITE_BACKEND_PATH}/auth/google`, {
          token,
          firstname: user.firstName,
          lastname: user.lastName,
          email: user.emailAddresses[0]?.emailAddress,
          google_id: user.id,
        }, { withCredentials: true });

        navigate('/dashboard');
      } catch (err) {
        console.error('Failed to sync with backend:', err);
        navigate('/');
      }
    };

    syncWithBackend();
  }, [isLoaded, user]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', flexDirection: 'column', gap: '16px',
    }}>
        <Cursor/>
      <div style={{
        width: '40px', height: '40px',
        border: '2px solid var(--border)',
        borderTop: '2px solid var(--blue)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-2)', fontSize: '14px', fontFamily: 'var(--font-body)' }}>
        Signing you in...
      </p>
    </div>
  );
}

export default function SSOCallback() {
  return (
    <AuthenticateWithRedirectCallback>
      <SyncUser />
    </AuthenticateWithRedirectCallback>
  );
}