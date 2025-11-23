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
            <Modal.Title className="modal-title-text">Clarity</Modal.Title>
            <p className="modal-subtitle muted-text">Your Emotional Spending Coach</p>
          </div>
        </div>
      </Modal.Header>
      
      <Modal.Body className="modal-body-custom">
        <div className="app-description-content">
          <div className="description-intro">
            <p className="intro-text">
              Clarity helps you understand and manage your emotional spending by connecting 
              your financial decisions with your emotional state.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Insights</h3>
              <p className="feature-description">
                Discover patterns in your spending behavior and identify emotional triggers 
                that lead to unnecessary purchases.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✍️</div>
              <h3 className="feature-title">Check-in</h3>
              <p className="feature-description">
                Log how you're feeling and track your spending decisions in real-time 
                to build awareness around emotional spending.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Summary</h3>
              <p className="feature-description">
                View comprehensive spending overviews and receive personalized insights 
                about your financial habits.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎤</div>
              <h3 className="feature-title">Voice</h3>
              <p className="feature-description">
                Record voice memos to add context to your transactions and capture 
                your emotional state at the moment of purchase.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Goals</h3>
              <p className="feature-description">
                Set and track your financial goals while identifying emotional blockers 
                that prevent you from achieving them.
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
                  <p>Clarity analyzes your data to reveal emotional triggers and spending patterns.</p>
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
