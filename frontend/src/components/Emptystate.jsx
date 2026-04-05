import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const suggestions = [
  "State of Multimodal LLMs in 2026",
  "How to build a RAG pipeline with LangChain",
  "FastAPI vs Django: which to choose in 2026",
  "Understanding self-attention mechanisms",
];

export default function EmptyState({ onNewBlog }) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onNewBlog(topic.trim());
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px', textAlign: 'center',
    }}>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{
          width: '56px', height: '56px',
          background: 'var(--white)', borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 32px rgba(255,255,255,0.1)',
        }}>
          <Sparkles size={24} color="#0a0a0b" strokeWidth={2.5} />
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px', fontWeight: 700,
          color: 'var(--text)', letterSpacing: '-0.03em',
          marginBottom: '10px',
        }}>
          What do you want to write about?
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-2)', fontWeight: 300, marginBottom: '36px', maxWidth: '400px' }}>
          Enter a topic and our multi-agent pipeline will research, plan, and write a high-quality technical blog for you.
        </p>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '560px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. How transformers work under the hood"
              style={{
                flex: 1, padding: '14px 18px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                color: 'var(--text)', fontSize: '15px',
                fontFamily: 'var(--font-body)', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button type="submit" className="btn btn-blue" style={{ padding: '14px 24px', gap: '8px' }}>
              Generate <ArrowRight size={15} />
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '560px' }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onNewBlog(s)}
              style={{
                padding: '7px 14px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)', fontSize: '13px',
                color: 'var(--text-2)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}