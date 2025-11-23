import { Container, Row, Col } from 'react-bootstrap';
import WidgetCard from '../components/WidgetCard';
import { Link } from 'react-router-dom';
import './AboutPage.css';

function AboutPage() {

  return (
    <Container fluid className="py-4 about-page">
      <div className="about-hero-section">
        <div className="hero-icon">💎</div>
        <h1 className="hero-title">Pulse</h1>
        <p className="hero-subtitle muted-text">Take Control of Your Emotional Spending</p>
      </div>

      <div className="description-intro-section">
        <WidgetCard accent="primary">
          <p className="intro-text">
            Ever wonder why you spend money when you're stressed, tired, or just feeling down? 
            Pulse reveals the hidden connection between your emotions and your wallet. Get real-time 
            insights into your spending patterns, discover what triggers your impulse purchases, 
            and take control of your finances with personalized coaching that actually works.
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
                Unlock powerful insights into your spending psychology. See exactly how your mood 
                affects your wallet with beautiful visualizations and AI-powered analysis that 
                reveals patterns you never noticed before.
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
                Capture your emotional state at the moment of purchase. Build self-awareness 
                and break the cycle of unconscious spending by understanding the "why" behind 
                every transaction.
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
                Get a complete picture of your financial health with smart summaries that 
                highlight overspending, category trends, and actionable recommendations 
                tailored to your unique spending style.
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
                Set meaningful financial goals and track your progress with AI coaching 
                that helps you overcome the emotional barriers standing between you and 
                your financial freedom.
              </p>
            </WidgetCard>
          </Col>

          <Col md={6} lg={4}>
            <WidgetCard 
              title="💳 Transactions"
              subtitle="Track spending"
              accent="primary"
              interactive={true}
            >
              <p className="feature-description muted-text">
                See all your transactions in one place, automatically categorized and 
                tagged with emotional context. Understand your complete financial picture 
                at a glance.
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
                Simply log your purchases and how you felt in that moment. Whether you're 
                stressed, happy, tired, or anxious—Pulse captures it all to build your 
                personalized spending profile.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Identify Patterns</h3>
              <p className="step-description muted-text">
                Pulse's AI analyzes your spending patterns in real-time, uncovering the emotional 
                triggers you never knew existed. See exactly when and why you overspend—whether 
                it's stress, peer pressure, or late-night fatigue.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Get Personalized Insights</h3>
              <p className="step-description muted-text">
                Get personalized, AI-powered coaching that adapts to your spending patterns. 
                Receive real-time alerts, smart suggestions, and proven strategies to help 
                you build lasting financial wellness.
              </p>
            </div>
          </Col>
        </Row>
      </div>

      <div className="cta-section">
        <WidgetCard accent="primary">
          <div className="cta-content">
            <h3 className="cta-title">Start Tracking Your Emotional Spending</h3>
            <p className="cta-text muted-text">
              Join thousands who've transformed their relationship with money. Stop the cycle of 
              impulse buying and start making financial decisions you'll actually feel good about tomorrow.
            </p>
            <div className="cta-buttons">
              <Link to="/check-in">
                <button className="btn-primary-custom">Add Check-in</button>
              </Link>
              <Link to="/">
                <button className="btn-secondary-custom">View Insights</button>
              </Link>
            </div>
          </div>
        </WidgetCard>
      </div>
    </Container>
  );
}

export default AboutPage;

