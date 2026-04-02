import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, XIcon, GitBranch} from 'lucide-react';

const links = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Resources: ['Documentation', 'API Reference', 'Examples'],
  Company: ['About', 'Blog', 'Contact'],
};

export default function Footer() {
  return (
    <footer style={{ position: 'relative', borderTop: '1px solid var(--border)', paddingTop: '80px', paddingBottom: '40px' }}>

      {/* Top glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--blue), var(--green), transparent)',
        opacity: 0.5,
      }} />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', justifyContent: 'space-between', gap: '48px', flexWrap: 'wrap', marginBottom: '72px' }}
        >

          {/* Brand */}
          <div style={{ maxWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '30px', height: '30px',
                background: 'var(--white)', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={14} color="#0a0a0b" strokeWidth={2.5} />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: '17px',
                color: 'var(--text)', letterSpacing: '-0.03em',
              }}>
                BlogForge
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.7, fontWeight: 300, marginBottom: '24px' }}>
              Multi-agent AI that researches, plans, and writes high-quality technical blogs — in minutes.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { icon: XIcon, href: '#', label: 'Twitter' },
                { icon: GitBranch, href: '#', label: 'GitHub' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: '34px', height: '34px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-3)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-3)';
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
            {Object.entries(links).map(([group, items]) => (
              <div key={group}>
                <div style={{
                  fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--text-3)', marginBottom: '20px',
                }}>
                  {group}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {items.map(item => (
                    <a
                      key={item}
                      href="#"
                      className="nav-link"
                      style={{ fontSize: '14px' }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            paddingTop: '28px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
            © {new Date().getFullYear()} BlogForge. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '28px' }}>
            {['Privacy Policy', 'Terms of Service'].map(item => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: '13px', color: 'var(--text-3)',
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                {item}
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </footer>
  );
}