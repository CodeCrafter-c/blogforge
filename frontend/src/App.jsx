import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Cursor from './components/Cursor';
import AuthModal from './components/Authmodal';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import SSOCallback from './pages/SSOCallback';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function Landing() {
  const [authModal, setAuthModal] = useState(null);

  return (
    <>
      <Cursor />
      <Navbar onLogin={() => setAuthModal('login')} onRegister={() => setAuthModal('register')} />
      <main>
        <Hero onGetStarted={() => setAuthModal('register')} />
        <Features />
        <Pricing onGetStarted={() => setAuthModal('register')} />
      </main>
      <Footer />
      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}