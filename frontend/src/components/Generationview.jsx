import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Loader, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';
const API = import.meta.env.VITE_BACKEND_PATH;


const eventIcon = (event) => {
  switch (event) {
    case 'router_done': return '📊';
    case 'research_start': return '🌐';
    case 'research_done': return '✅';
    case 'plan_start': return '📋';
    case 'plan_ready': return '⏸️';
    case 'writing_start': return '✍️';
    case 'section_done': return '✅';
    case 'draft_ready': return '⏸️';
    case 'saving': return '💾';
    case 'done': return '🎉';
    case 'error': return '❌';
    default: return '🔍';
  }
};

function PlanApproval({ plan, blogId, onApproved }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handle = async (approved) => {
    setLoading(true);
    try {
      await axios.post(`${API}/blog/approve-plan`, {
        blog_id: blogId,
        approved,
        feedback: approved ? null : feedback,
      }, { withCredentials: true });
      onApproved(approved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(79,142,247,0.3)',
        borderRadius: 'var(--r-xl)',
        padding: '24px',
        marginTop: '16px',
        boxShadow: '0 0 24px rgba(79,142,247,0.08)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            📋 {plan?.blog_title}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 300 }}>
            {plan?.tasks?.length} sections planned — review and approve to start writing
          </p>
        </div>
        <button
          onClick={() => setExpanded(s => !s)}
          style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide' : 'View'} plan
        </button>
      </div>

      {/* Plan sections */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '16px', overflow: 'hidden' }}
          >
            {plan?.tasks?.map((task, i) => (
              <div key={i} style={{
                padding: '12px', marginBottom: '8px',
                background: 'var(--bg-3)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                  {i + 1}. {task.title}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 300 }}>
                  {task.goal}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback input */}
      <input
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Optional: suggest changes before approving..."
        style={{
          width: '100%', padding: '10px 14px', marginBottom: '12px',
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', color: 'var(--text)',
          fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--blue)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => handle(true)}
          disabled={loading}
          className="btn btn-blue"
          style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ThumbsUp size={14} />}
          Approve & Start Writing
        </button>
        <button
          onClick={() => handle(false)}
          disabled={loading || !feedback.trim()}
          className="btn btn-ghost"
          style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: !feedback.trim() ? 0.4 : 1 }}
        >
          <ThumbsDown size={14} />
          Re-plan with Feedback
        </button>
      </div>
    </motion.div>
  );
}

function DraftApproval({ blogId, onApproved }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (approved) => {
    setLoading(true);
    try {
      await axios.post(`${API}/blog/approve-draft`, {
        blog_id: blogId,
        approved,
        Feedback: approved ? null : feedback,
      }, { withCredentials: true });
      onApproved(approved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(62,207,142,0.3)',
        borderRadius: 'var(--r-xl)',
        padding: '24px',
        marginTop: '16px',
        boxShadow: '0 0 24px rgba(62,207,142,0.08)',
      }}
    >
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
        📝 Draft is ready!
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 300, marginBottom: '16px' }}>
        Review the full draft. Approve to finalize or request changes.
      </p>

      <input
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Optional: request specific changes..."
        style={{
          width: '100%', padding: '10px 14px', marginBottom: '12px',
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', color: 'var(--text)',
          fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--green)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => handle(true)}
          disabled={loading}
          style={{
            flex: 1, padding: '12px', border: 'none',
            background: 'var(--green)', color: '#fff',
            borderRadius: 'var(--r-full)', fontWeight: 600, fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
          }}
        >
          {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ThumbsUp size={14} />}
          Approve & Finalize
        </button>
        <button
          onClick={() => handle(false)}
          disabled={loading || !feedback.trim()}
          className="btn btn-ghost"
          style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: !feedback.trim() ? 0.4 : 1 }}
        >
          <ThumbsDown size={14} />
          Request Changes
        </button>
      </div>
    </motion.div>
  );
}

export default function GenerationView({ blog, onCompleted }) {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState('');
  const [stage, setStage] = useState('running'); // 'running' | 'plan_approval' | 'draft_approval' | 'done' | 'error'
  const [planData, setPlanData] = useState(null);
  const bottomRef = useRef(null);
  const esRef = useRef(null);


  const stageRef = useRef('running');

  const updateStage = (s) => {
    stageRef.current = s;
    setStage(s);
  };

const addEvent = useRef();

addEvent.current = (eventType, data) => {
  setEvents(prev => [...prev, { event: eventType, data, ts: Date.now() }]);
  setCurrentEvent(data.message || '');
};
  const handleMessage = (ev) => {
    console.log("add",typeof addEvent);         // object
    console.log("addevent.curent",typeof addEvent.current); // function
  if (!ev.data || ev.data === '{}') return;
  try {
    const data = JSON.parse(ev.data);
    const type = ev.event;

    addEvent.current(type, data);

    if (type === 'plan_ready') {
      setPlanData(data.plan);
      updateStage('plan_approval');
      esRef.current?.abort();
    }
    if (type === 'draft_ready') {
      updateStage('draft_approval');
      esRef.current?.abort();
    }
    if (type === 'done') {
      updateStage('done');
      esRef.current?.abort();
      setTimeout(() => onCompleted(blog._id), 1200);
    }
    if (type === 'error') {
      updateStage('error');
      esRef.current?.abort();
    }
  } catch (e) {
    
    console.error('SSE parse error:', e);
  }
};

    const startSSE = () => {
  // ✅ kill previous connection FIRST
  if (esRef.current) {
    esRef.current.abort();
    esRef.current = null;
  }

  const controller = new AbortController();
  esRef.current = controller;


  fetchEventSource(`${API}/blog/generate/${blog._id}`, {
    method: 'GET',
    credentials: 'include',
    signal: controller.signal,
    retry: 0,
    onopen(res) {
      if (!res.ok) throw new Error(`SSE failed: ${res.status}`);
    },
    onmessage(ev) {
      console.log("NEW HANDLER RUNNING ✅"); // 👈 MUST PRINT

      handleMessage(ev);
    },
    onerror(err) {
  console.error("SSE error:", err);

  if (
    stageRef.current !== 'plan_approval' &&
    stageRef.current !== 'draft_approval'
  ) {
    updateStage('error');
  }

  // ❌ DO NOT THROW
  // ✅ Just return to stop retry loop
},
  });
};


const listenSSE = () => {
  const controller = new AbortController();
  esRef.current = controller;
  fetchEventSource(`${API}/blog/stream/${blog._id}`, {
    method: 'GET',
    credentials: 'include',
    signal: controller.signal,
    retry: 0,
    onopen(res) {
      if (!res.ok) throw new Error(`Stream failed: ${res.status}`);
    },
    onmessage: handleMessage,  // ✅ same shared handler
    onerror(err) {
  console.error("Stream error:", err);

  if (
    stageRef.current !== 'plan_approval' &&
    stageRef.current !== 'draft_approval'
  ) {
    updateStage('error');
  }

  return; // ✅ DO NOT THROW
},
  });
};

// after approval — use listenSSE not startSSE
const handlePlanApproved = (approved) => {
  updateStage('running');
  setEvents(prev => [...prev, {
    event: approved ? 'plan_approved' : 'plan_start',
    data: { message: approved ? '✅ Plan approved — starting writers...' : '🔄 Re-planning...' },
    ts: Date.now(),
  }]);
  setTimeout(() => listenSSE(), 300);  // ✅ not startSSE
};

const handleDraftApproved = (approved) => {
  updateStage('running');
  setEvents(prev => [...prev, {
    event: approved ? 'draft_approved' : 'plan_start',
    data: { message: approved ? '✅ Draft approved — finalizing...' : '🔄 Re-generating...' },
    ts: Date.now(),
  }]);
      setTimeout(() => listenSSE(), 300);
  // ✅ not startSSE
};

  useEffect(() => {
    startSSE();
    return () => esRef.current?.abort();
  }, [blog._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);


  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          {blog.blog_title || blog.topic}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {stage === 'running' && (
            <Loader size={12} color="var(--amber)" style={{ animation: 'spin 1s linear infinite' }} />
          )}
          <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
            {stage === 'running' ? currentEvent || 'Starting pipeline...' :
             stage === 'plan_approval' ? '⏸️ Waiting for plan approval' :
             stage === 'draft_approval' ? '⏸️ Waiting for draft approval' :
             stage === 'done' ? '🎉 Completed!' : '❌ Error occurred'}
          </span>
        </div>
      </div>

      {/* Event timeline + HITL */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {events.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
            >
              <span style={{ fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>
                {eventIcon(ev.event)}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 300, lineHeight: 1.5 }}>
                {ev.data.message}
              </span>
            </motion.div>
          ))}

          {/* Running pulse */}
          {stage === 'running' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <Loader size={14} color="var(--blue)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                Working...
              </span>
            </div>
          )}
        </div>

        {/* HITL 1 — Plan approval */}
        {stage === 'plan_approval' && (
          <PlanApproval
            plan={planData}
            blogId={blog._id}
            onApproved={handlePlanApproved}
          />
        )}

        {/* HITL 2 — Draft approval */}
        {stage === 'draft_approval' && (
          <DraftApproval
            blogId={blog._id}
            onApproved={handleDraftApproved}
          />
        )}

        {/* Done */}
        {stage === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '32px', marginTop: '16px' }}
          >
            <div style={{ width: '52px', height: '52px', background: 'rgba(62,207,142,0.15)', border: '1px solid rgba(62,207,142,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle size={24} color="var(--green)" />
            </div>
            <p style={{ fontSize: '15px', color: 'var(--text)', fontWeight: 600 }}>Blog complete!</p>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>Loading your blog...</p>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}