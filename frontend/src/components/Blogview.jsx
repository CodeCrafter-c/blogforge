import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, XIcon, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_PATH;

export default function BlogView({ blog, onDelete }) {
  const [posting, setPosting] = useState(false);
  const [tweetUrl, setTweetUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([blog.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blog.blog_title || 'blog'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(blog.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = async () => {
    setPosting(true);
    try {
      const res = await axios.post(
        `${API}/blog/${blog._id}/message`,
        { type: 'publish_twitter', content: 'Post to Twitter' },
        { withCredentials: true }
      );
      setTweetUrl(res.data.tweet_url);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
      
    }
  };

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        padding: '20px 28px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {blog.blog_title}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>
            {blog.mode} · {blog.sources?.length || 0} sources
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleCopy}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', fontSize: '13px', color: 'var(--text-2)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {copied ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', fontSize: '13px', color: 'var(--text-2)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Download size={13} /> Download MD
          </button>

          {tweetUrl ? (
            <a href={tweetUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--blue)', borderRadius: 'var(--r-full)', fontSize: '13px', color: '#fff', textDecoration: 'none' }}
            >
              <ExternalLink size={13} /> View Tweet
            </a>
          ) : (
            <button
              onClick={handleTwitter}
              disabled={posting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', fontSize: '13px', color: 'var(--text-2)', transition: 'all 0.2s', opacity: posting ? 0.6 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--blue)'; e.currentTarget.style.borderColor = 'var(--blue)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <XIcon size={13} /> {posting ? 'Posting...' : 'Post to X'}
            </button>
          )}

          <button
            onClick={onDelete}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', fontSize: '13px', color: 'var(--text-3)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--pink)'; e.currentTarget.style.borderColor = 'var(--pink)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 28px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {/* Markdown rendered as styled prose */}
          <div
            style={{
              color: 'var(--text)',
              lineHeight: 1.8,
              fontSize: '16px',
              fontWeight: 300,
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
          />

          {/* Sources */}
          {blog.sources?.length > 0 && (
            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Sources
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {blog.sources.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: 'var(--blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    <ExternalLink size={11} /> {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(md) {
  if (!md) return '';
  
  // ── 1. extract code blocks and replace with placeholders ──
  const codeBlocks = [];
  md = md.replace(/```[\w]*\n([\s\S]*?)```/gm, (match, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(code);
    return `%%CODEBLOCK_${idx}%%`;
  });

  // ── 2. now safely apply all other transformations ──
  md = md
    .replace(/^# (.+)$/gm,
      '<h1 style="font-family:var(--font-display);font-size:32px;font-weight:800;color:var(--text);letter-spacing:-0.03em;margin:0 0 24px;line-height:1.1">$1</h1>')
    .replace(/^## (.+)$/gm,
      '<h2 style="font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--text);letter-spacing:-0.02em;margin:40px 0 16px;line-height:1.2">$1</h2>')
    .replace(/^### (.+)$/gm,
      '<h3 style="font-family:var(--font-display);font-size:17px;font-weight:600;color:var(--text);margin:28px 0 10px">$1</h3>')
    .replace(/`([^`\n]+)`/g,
      '<code style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:2px 6px;font-size:13px;font-family:monospace;color:var(--blue)">$1</code>')
    .replace(/\*\*(.+?)\*\*/g,
      '<strong style="color:var(--text);font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm,
      '<li style="margin:6px 0;color:var(--text-2);line-height:1.6">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>)/g,
      '<ul style="padding-left:24px;margin:16px 0;list-style:disc">$1</ul>')
    .replace(/^\d+\. (.+)$/gm,
      '<li style="margin:6px 0;color:var(--text-2);line-height:1.6">$1</li>')
    .replace(/^---$/gm,
      '<hr style="border:none;border-top:1px solid var(--border);margin:32px 0">')
    .replace(/^(?!<)(.+)$/gm,
      '<p style="margin:0 0 16px;color:var(--text-2);line-height:1.8">$1</p>')
    .replace(/<p[^>]*>\s*<\/p>/g, '');

  // ── 3. restore code blocks ──
  codeBlocks.forEach((code, idx) => {
    md = md.replace(
      `%%CODEBLOCK_${idx}%%`,
      `<pre style="background:var(--bg-3);border:1px solid var(--border);border-radius:12px;padding:20px;overflow-x:auto;margin:24px 0"><code style="font-family:monospace;font-size:13px;color:var(--text);line-height:1.7;white-space:pre">${code}</code></pre>`
    );
  });

  return md;
}