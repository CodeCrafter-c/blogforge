import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cursor from '../components/Cursor';
import Sidebar from '../components/Sidebar';
import GenerationView from '../components/GenerationView'
import BlogView from '../components/Blogview';
import EmptyState from '../components/Emptystate';

const API = import.meta.env.VITE_BACKEND_PATH;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [activeBlogId, setActiveBlogId] = useState(null);
  const [activeBlog, setActiveBlog] = useState(null);
  const [view, setView] = useState('empty');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    axios.get(`${API}/auth/me`, { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => navigate('/'));
  }, []);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/blog/history`, { withCredentials: true });
      setBlogs(res.data.blogs);
    } catch (err) { console.error(err); }
  };

  const handleNewBlog = async (topic) => {
    try {
      const res = await axios.post(`${API}/blog/create`, { topic }, { withCredentials: true });
      const blogId = res.data.blog_id;
      setActiveBlogId(blogId);
      setActiveBlog({ _id: blogId, topic, status: 'generating' });
      setView('generating');
      await fetchHistory();
    } catch (err) { console.error(err); }
  };

  const handleSelectBlog = async (blogId) => {
    try {
      const res = await axios.get(`${API}/blog/${blogId}`, { withCredentials: true });
      setActiveBlog(res.data);
      setActiveBlogId(blogId);
      setView(res.data.status === 'completed' ? 'blog' : 'generating');
    } catch (err) { console.error(err); }
  };

  const handleBlogCompleted = async (blogId) => {
    await fetchHistory();
    const res = await axios.get(`${API}/blog/${blogId}`, { withCredentials: true });
    setActiveBlog(res.data);
    setView('blog');
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      await axios.delete(`${API}/blog/${blogId}`, { withCredentials: true });
      await fetchHistory();
      if (activeBlogId === blogId) {
        setActiveBlogId(null);
        setActiveBlog(null);
        setView('empty');
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } finally {
      navigate('/');
    }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden',
    }}>
      <Cursor />
      <Sidebar
        user={user}
        blogs={blogs}
        activeBlogId={activeBlogId}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(s => !s)}
        onNewBlog={handleNewBlog}
        onSelectBlog={handleSelectBlog}
        onDeleteBlog={handleDeleteBlog}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {view === 'empty' && <EmptyState onNewBlog={handleNewBlog} />}
        {view === 'generating' && activeBlog && (
          <GenerationView blog={activeBlog} onCompleted={handleBlogCompleted} />
        )}
        {view === 'blog' && activeBlog && (
          <BlogView blog={activeBlog} onDelete={() => handleDeleteBlog(activeBlogId)} />
        )}
      </main>
    </div>
  );
}