import React, { useState } from 'react';
import './index.css';
import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import AuthModal from './components/Authmodal';

function App() {
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'

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
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
}

export default App;