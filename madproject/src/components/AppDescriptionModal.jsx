import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AppDescriptionModal.css';

function AppDescriptionModal({ show, onHide }) {
  const navigate = useNavigate();
  const { isAuthenticated, isGuest } = useAuth();

  const handleGetStarted = () => {
    onHide();
    if (!isAuthenticated) {
      navigate('/signup');
    }
  };

  const handleContinueAsGuest = () => {
    onHide();
    // If already authenticated, just close the modal
    if (!isAuthenticated) {
      // This would be handled by the parent component
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      className="app-description-modal"
      size="lg"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <div className="modal-title-section">
          <div className="app-icon-large">💎</div>
          <div>
            <Modal.Title className="modal-title-text">Pulse</Modal.Title>
            <p className="modal-subtitle muted-text">Take Control of Your Emotional Spending</p>
          </div>
        </div>
      </Modal.Header>
      
      <Modal.Body className="modal-body-custom">
        <div className="app-description-content">
          <div className="description-intro">
            <p className="intro-text">
              Stop wondering where your money went. Pulse reveals the hidden connection between 
              your emotions and your spending, giving you the insights you need to take control 
              of your finances and build healthier money habits.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Insights</h3>
              <p className="feature-description">
                Unlock powerful insights into your spending psychology with beautiful visualizations 
                and AI analysis that reveals the emotional triggers driving your purchases.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✍️</div>
              <h3 className="feature-title">Check-in</h3>
              <p className="feature-description">
                Capture your emotional state at the moment of purchase. Build self-awareness 
                and break the cycle of unconscious spending by understanding the "why" behind every transaction.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Summary</h3>
              <p className="feature-description">
                Get a complete picture of your financial health with smart summaries, 
                overspending alerts, and actionable recommendations tailored to your unique spending style.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎤</div>
              <h3 className="feature-title">Voice</h3>
              <p className="feature-description">
                Use voice to quickly capture your thoughts and feelings. Just speak naturally— 
                Pulse's AI understands your emotions and automatically links them to your transactions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Goals</h3>
              <p className="feature-description">
                Set meaningful financial goals and track your progress with AI coaching 
                that helps you overcome the emotional barriers standing between you and your financial freedom.
              </p>
            </div>
          </div>

          <div className="how-it-works-section">
            <h3 className="section-title">How It Works</h3>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Track Your Spending</strong>
                  <p>Log purchases and note how you were feeling when you made them.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Identify Patterns</strong>
                  <p>Pulse's AI analyzes your spending in real-time, uncovering the emotional triggers 
                  you never knew existed—whether it's stress, peer pressure, or late-night fatigue.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Get Personalized Insights</strong>
                  <p>Receive actionable advice to help you make better financial decisions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="modal-footer-custom">
        {!isAuthenticated && (
          <Button 
            className="btn-secondary-custom"
            onClick={onHide}
          >
            Close
          </Button>
        )}
        {!isAuthenticated && (
          <Button 
            className="btn-primary-custom"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        )}
        {isAuthenticated && (
          <Button 
            className="btn-primary-custom"
            onClick={onHide}
          >
            Got it
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default AppDescriptionModal;
