import React from 'react';
import './Home.css';

export default function AIEducationLanding({ onStart, onLogin }) {
  return (
    <div className="ai-education">
      {/* Site Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <div className="logo-inner"></div>
          </div>
          <span className="logo-text">Clanker</span>
        </div>
        
        <nav className="nav">
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">Pricing</a>
          <a href="#" className="nav-link">About</a>
        </nav>
        
        <div className="header-actions">
          <button className="btn-text" onClick={onLogin}>Login</button>
          <button className="btn-primary" onClick={onStart}>Get Started</button>
        </div>
      </header>

      {/* Main Section */}
      <section className="main">
        <div className="main-content">
          <div className="main-text">
            <div className="badge">
              <span>✨ NEW: AI COURSE GENERATION</span>
            </div>
            
            <h1 className="main-title">
              Master Your<br />
              Subject with <span className="text-blue">AI</span>
            </h1>
            
            <p className="main-description">
              Personalized learning paths designed by us, refined by you <br/>
              Unlock your full potential through custom-tailored curricula
            </p>
            
            <div className="main-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="email-input"
              />
              <button className="btn-primary">Join for Free</button>
            </div>
            
            <div className="social-proof">
              <div className="avatars">
                <div className="avatar avatar-1"></div>
                <div className="avatar avatar-2"></div>
                <div className="avatar avatar-3"></div>
              </div>
              <span>Loved by 50K+ students</span>
            </div>
          </div>
          
          <div className="main-visual">
            <div className="brain-card">
              <svg viewBox="0 0 200 200" className="brain-svg">
                <defs>
                  <linearGradient id="brainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1e40af" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                
                {/* Left hemisphere */}
                <path
                  d="M 60 50 Q 40 50 30 70 Q 25 90 30 110 Q 35 130 50 140 Q 65 145 75 135 L 75 110 Q 75 90 70 70 Q 65 55 60 50 Z"
                  fill="none"
                  stroke="url(#brainGradient)"
                  strokeWidth="1.5"
                />
                
                {/* Right hemisphere */}
                <path
                  d="M 140 50 Q 160 50 170 70 Q 175 90 170 110 Q 165 130 150 140 Q 135 145 125 135 L 125 110 Q 125 90 130 70 Q 135 55 140 50 Z"
                  fill="none"
                  stroke="url(#brainGradient)"
                  strokeWidth="1.5"
                />
                
                {/* Brain details - left */}
                <path d="M 45 70 Q 50 75 55 70" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                <path d="M 40 90 Q 45 95 50 90" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                <path d="M 45 110 Q 50 115 55 110" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                
                {/* Brain details - right */}
                <path d="M 145 70 Q 150 75 155 70" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                <path d="M 150 90 Q 155 95 160 90" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                <path d="M 145 110 Q 150 115 155 110" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                
                {/* Center connection */}
                <line x1="75" y1="100" x2="125" y2="100" stroke="#3b82f6" strokeWidth="2" opacity="0.6" />
                
                {/* Central keyhole/lock */}
                <circle cx="100" cy="100" r="20" fill="#1e40af" opacity="0.8" />
                <circle cx="100" cy="100" r="8" fill="#3b82f6" />
                <rect x="96" y="100" width="8" height="15" rx="2" fill="#3b82f6" />
                
                {/* Animated pulse dot */}
                <circle cx="100" cy="60" r="4" fill="#3b82f6" className="pulse-dot" />
              </svg>
              
              <div className="brain-label">
                <p className="brain-title">AI</p>
                <p className="brain-subtitle">Machine & Reasoning</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <div>
            <h2 className="section-title">How it Works</h2>
            <p className="section-description">
              Three simple steps to accelerate your learning journey<br />
              with our advanced AI.
            </p>
          </div>
          <a href="#" className="link-with-arrow">
            View Detailed Guide <span>→</span>
          </a>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Choose Your Topic</h3>
            <p className="feature-description">
              Input any subject from Quantum Physics to Creative Writing. Our engine supports over 2,500 specialized domains.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3 className="feature-title">Generate Path</h3>
            <p className="feature-description">
              Our AI builds a custom curriculum based on your current knowledge level, time availability, and learning goals.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3 className="feature-title">Learn & Test</h3>
            <p className="feature-description">
              Engage with interactive modules and adaptive AI quizzes that identify your gaps and reinforce mastery.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">
            Ready to start your<br />
            personalized learning<br />
            journey?
          </h2>
          
          <p className="cta-description">
            Experience the future of education with AI-driven paths that evolve with you. 
            No credit card required to start.
          </p>
          
          <div className="cta-buttons">
            <button className="btn-white">Start Learning for Free</button>
            <button className="btn-secondary">Talk to Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
                  <div className="logo-inner"></div>
                </div>
                <span className="logo-text">AI Education</span>
              </div>
              <p className="footer-description">
                Building the future of individual growth through generative intelligence and pedagogical science.
              </p>
              <div className="social-links">
                <button className="social-btn">📱</button>
                <button className="social-btn">🌙</button>
                <button className="social-btn">📄</button>
              </div>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-heading">Product</h4>
              <ul className="footer-links">
                <li><a href="#">Course Gen</a></li>
                <li><a href="#">AI Tutor</a></li>
                <li><a href="#">Enterprise</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">API</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-heading">Account</h4>
              <ul className="footer-links">
                <li><a href="#">Login</a></li>
                <li><a href="#">Sign Up</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2024 AI Education Inc. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}