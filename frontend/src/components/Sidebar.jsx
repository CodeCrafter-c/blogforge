import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, LogOut, ChevronLeft, ChevronRight, Trash2, FileText, Clock } from 'lucide-react';

const statusColor = {
  idle: 'var(--text-3)',
  generating: 'var(--amber)',
  awaiting_plan_approval: 'var(--blue)',
  awaiting_draft_approval: 'var(--blue)',
  completed: 'var(--green)',
  failed: 'var(--pink)',
};

const statusLabel = {
  idle: 'Idle',
  generating: 'Generating...',
  awaiting_plan_approval: 'Awaiting approval',
  awaiting_draft_approval: 'Awaiting approval',
  completed: 'Completed',
  failed: 'Failed',
};

export default function Sidebar({ user, blogs, activeBlogId, open, onToggle, onNewBlog, onSelectBlog, onDeleteBlog, onLogout }) {
  const [topic, setTopic] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onNewBlog(topic.trim());
    setTopic('');
  };

  return (
    <motion.aside
      animate={{ width: open ? 280 : 60 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        height: '100vh', flexShrink: 0,
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px 16px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div style={{ width: '26px', height: '26px', background: 'var(--white)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={13} color="#0a0a0b" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text)', letterSpacing: '-0.03em' }}>
                BlogForge
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          style={{ width: '28px', height: '28px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', transition: 'all 0.2s', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* New blog input */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: '16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ position: 'relative' }}>
                <input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="New blog topic..."
                  style={{
                    width: '100%', padding: '10px 36px 10px 12px',
                    background: 'var(--bg-3)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--text)', fontSize: '13px',
                    fontFamily: 'var(--font-body)', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="submit"
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: topic.trim() ? 'var(--blue)' : 'var(--text-3)', transition: 'color 0.2s', padding: '2px' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed new blog button */}
      {!open && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => onToggle()}
            style={{ width: '28px', height: '28px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.borderColor = 'var(--blue)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      {/* Blog history */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {blogs.length === 0 ? (
                <div style={{ padding: '24px 8px', textAlign: 'center' }}>
                  <FileText size={20} color="var(--text-3)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 300 }}>No blogs yet</p>
                </div>
              ) : (
                blogs.map((blog, i) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onMouseEnter={() => setHoveredId(blog._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onSelectBlog(blog._id)}
                    style={{
                      padding: '10px 12px', borderRadius: 'var(--r-md)',
                      marginBottom: '2px', cursor: 'none',
                      background: activeBlogId === blog._id ? 'var(--surface)' : 'transparent',
                      border: `1px solid ${activeBlogId === blog._id ? 'var(--border)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseOver={e => { if (activeBlogId !== blog._id) e.currentTarget.style.background = 'var(--surface)'; }}
                    onMouseOut={e => { if (activeBlogId !== blog._id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Status dot */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: statusColor[blog.status] || 'var(--text-3)',
                        marginTop: '5px', flexShrink: 0,
                        boxShadow: blog.status === 'generating' ? `0 0 6px ${statusColor[blog.status]}` : 'none',
                        animation: blog.status === 'generating' ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                          {blog.blog_title || blog.topic}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 300 }}>
                          {statusLabel[blog.status] || blog.status}
                        </p>
                      </div>

                      {/* Delete button */}
                      {hoveredId === blog._id && (
                        <button
                          onClick={e => { e.stopPropagation(); onDeleteBlog(blog._id); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: '2px', transition: 'color 0.2s', flexShrink: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--pink)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User + logout */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600, flexShrink: 0 }}>
          {user?.firstname?.[0]?.toUpperCase() || '?'}
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstname} {user?.lastname}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onLogout}
          style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: '4px', transition: 'color 0.2s', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--pink)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          <LogOut size={15} />
        </button>
      </div>
    </motion.aside>
  );
}