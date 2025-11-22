import { Container, Row, Col } from 'react-bootstrap';
import WidgetCard from '../components/WidgetCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AboutPage.css';

function AboutPage() {
  const { isAuthenticated } = useAuth();

  return (
    <Container className="py-4 about-page">
      <div className="about-hero-section">
        <div className="hero-icon">💎</div>
        <h1 className="hero-title">Clarity</h1>
        <p className="hero-subtitle muted-text">Your Emotional Spending Coach</p>
      </div>

      <div className="description-intro-section">
        <WidgetCard accent="primary">
          <p className="intro-text">
            Clarity helps you understand and manage your emotional spending by connecting 
            your financial decisions with your emotional state. Track your mood, identify 
            spending triggers, and develop healthier financial habits.
          </p>
        </WidgetCard>
      </div>

      <div className="features-section">
        <h2 className="section-heading">Key Features</h2>
        <Row className="g-3">
          <Col md={6} lg={4}>
            <WidgetCard 
              title="📊 Insights"
              subtitle="Discover patterns"
              accent="primary"
              interactive={true}
            >
              <p className="feature-description muted-text">
                Discover patterns in your spending behavior and identify emotional triggers 
                that lead to unnecessary purchases. Get personalized insights about your financial habits.
              </p>
            </WidgetCard>
          </Col>

          <Col md={6} lg={4}>
            <WidgetCard 
              title="✍️ Check-in"
              subtitle="Track your feelings"
              accent="success"
              interactive={true}
            >
              <p className="feature-description muted-text">
                Log how you're feeling and track your spending decisions in real-time 
                to build awareness around emotional spending.
              </p>
            </WidgetCard>
          </Col>

          <Col md={6} lg={4}>
            <WidgetCard 
              title="📋 Summary"
              subtitle="View overviews"
              accent="primary"
              interactive={true}
            >
              <p className="feature-description muted-text">
                View comprehensive spending overviews and receive personalized insights 
                about your financial habits and progress.
              </p>
            </WidgetCard>
          </Col>

          <Col md={6} lg={4}>
            <WidgetCard 
              title="🎤 Voice"
              subtitle="Add context"
              accent="success"
              interactive={true}
            >
              <p className="feature-description muted-text">
                Record voice memos to add context to your transactions and capture 
                your emotional state at the moment of purchase.
              </p>
            </WidgetCard>
          </Col>

          <Col md={6} lg={4}>
            <WidgetCard 
              title="🎯 Goals"
              subtitle="Set targets"
              accent="danger"
              interactive={true}
            >
              <p className="feature-description muted-text">
                Set and track your financial goals while identifying emotional blockers 
                that prevent you from achieving them.
              </p>
            </WidgetCard>
          </Col>
        </Row>
      </div>

      <div className="how-it-works-section">
        <h2 className="section-heading">How It Works</h2>
        <Row className="g-4">
          <Col md={4}>
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Track Your Spending</h3>
              <p className="step-description muted-text">
                Log purchases and note how you were feeling when you made them. 
                Use check-ins to capture your emotional state.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Identify Patterns</h3>
              <p className="step-description muted-text">
                Clarity analyzes your data to reveal emotional triggers and spending patterns. 
                Discover what drives your purchasing decisions.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Get Personalized Insights</h3>
              <p className="step-description muted-text">
                Receive actionable advice to help you make better financial decisions. 
                Set goals and track your progress over time.
              </p>
            </div>
          </Col>
        </Row>
      </div>

      {!isAuthenticated && (
        <div className="cta-section">
          <WidgetCard accent="primary">
            <div className="cta-content">
              <h3 className="cta-title">Ready to get started?</h3>
              <p className="cta-text muted-text">
                Sign up for free and start understanding your emotional spending patterns today.
              </p>
              <div className="cta-buttons">
                <Link to="/signup">
                  <button className="btn-primary-custom">Get Started</button>
                </Link>
                <Link to="/login">
                  <button className="btn-secondary-custom">Sign In</button>
                </Link>
              </div>
            </div>
          </WidgetCard>
        </div>
      )}
    </Container>
  );
}

export default AboutPage;

