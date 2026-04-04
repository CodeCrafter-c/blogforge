import React, { lazy } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Clock, LogOut } from 'lucide-react';
import Cursor from '../components/Cursor';
import { useNavigate } from 'react-router-dom'; 
import { useClerk } from '@clerk/clerk-react';
import axios from 'axios';

export default function Dashboard() {
    const navigate=useNavigate()
    const {signOut}=useClerk()
    const logoutHandler=async()=>{
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_PATH}/auth/logout`, {}, { withCredentials: true });
            //clear clerk session for google auth users
            await signOut()
            navigate('/')
        } catch (err) {
            console.error('Failed to logout:', err);
        }
    }
  return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
            <Cursor/>
      {/* Navbar */}
      <nav style={{
          padding: '16px 0',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(10,10,11,0.9)',
          backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', background: 'var(--white)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} color="#0a0a0b" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text)', letterSpacing: '-0.03em' }}>
              BlogForge
            </span>
          </div>
          <button
            onClick={() => logoutHandler()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 16px', color: 'var(--text-2)', fontSize: '14px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </nav>

      <div className="container" style={{ padding: '60px 28px' }}>

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '48px' }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
            Welcome back 👋
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-2)', fontWeight: 300 }}>
            What do you want to write about today?
          </p>
        </motion.div>

        {/* Generate box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '32px',
            marginBottom: '48px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              placeholder="Enter a topic — e.g. State of Multimodal LLMs in 2026"
              style={{
                flex: 1, padding: '14px 18px',
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                color: 'var(--text)', fontSize: '15px',
                fontFamily: 'var(--font-body)', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button className="btn btn-blue" style={{ padding: '14px 28px', whiteSpace: 'nowrap' }}>
              Generate Blog
            </button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}
        >
          {[
            { label: 'Blogs generated', value: '0', color: 'var(--blue)' },
            { label: 'Words written', value: '0', color: 'var(--green)' },
            { label: 'Posts published', value: '0', color: 'var(--amber)' },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: stat.color, letterSpacing: '-0.04em', marginBottom: '6px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 400 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Recent blogs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Recent blogs
          </h2>

          {/* Empty state */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '64px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <FileText size={22} color="var(--text-3)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
              No blogs yet
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-3)', fontWeight: 300 }}>
              Generate your first blog above to get started.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}