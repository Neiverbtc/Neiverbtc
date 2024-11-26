import React from 'react';
import { Shield, Key, RefreshCw, Lock, ChevronRight, Github, Twitter } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import LaunchApp from './pages/LaunchApp';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-20">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold">CryptoGuard</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-emerald-400 transition">Features</a>
            <a href="#security" className="hover:text-emerald-400 transition">Security</a>
            <a href="#contact" className="hover:text-emerald-400 transition">Contact</a>
            <button 
              onClick={() => navigate('/app')}
              className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition"
            >
              Launch App
            </button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
            Secure Your Digital Assets with Unbreakable Protection
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Advanced decentralized security protocol with autonomous fund recovery and homomorphic encryption
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/app')}
              className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-lg flex items-center gap-2 transition"
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </button>
            <button className="border border-slate-600 hover:border-emerald-400 px-8 py-3 rounded-lg transition">
              View Documentation
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Key className="w-8 h-8 text-emerald-400" />}
              title="Adaptive Multi-Signature"
              description="Advanced key management system with dynamic security thresholds based on transaction patterns"
            />
            <FeatureCard
              icon={<RefreshCw className="w-8 h-8 text-emerald-400" />}
              title="Autonomous Recovery"
              description="Self-sovereign fund recovery mechanism without third-party intervention"
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-emerald-400" />}
              title="Homomorphic Encryption"
              description="State-of-the-art encryption allowing secure operations on encrypted data"
            />
          </div>
        </div>
      </section>

      {/* Security Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-slate-800 rounded-2xl p-8 grid md:grid-cols-3 gap-8">
            <StatCard value="$10B+" label="Assets Protected" />
            <StatCard value="99.99%" label="Uptime" />
            <StatCard value="0" label="Security Breaches" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span className="font-bold">CryptoGuard</span>
            </div>
            <div className="flex gap-4">
              <a href="https://github.com" className="hover:text-emerald-400 transition">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://twitter.com" className="hover:text-emerald-400 transition">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-emerald-400 mb-2">{value}</div>
      <div className="text-slate-400">{label}</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<LaunchApp />} />
      </Routes>
    </Router>
  );
}

export default App;