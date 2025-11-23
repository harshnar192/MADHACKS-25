import { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import WidgetCard from '../components/WidgetCard';
import EmotionTag from '../components/EmotionTag';
import EmotionPieChart from '../components/EmotionPieChart';
import TransactionList from '../components/TransactionList';
import { 
  emotionalSpending, 
  emotionBreakdown, 
  invisibleSpending 
} from '../mockData';
import './InsightsPage.css';

function InsightsPage() {
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
    // TODO: Navigate to detailed view or show more info
  };

  const handleCardClick = (destination) => {
    navigate(destination);
  };

  return (
    <div className="insights-page-wrapper">
      <Container fluid className="insights-page-container">
        <div className="page-header mb-4">
          <h1 className="page-title">Insights Dashboard</h1>
          <p className="page-subtitle muted-text">Discover patterns in your spending behavior and emotional triggers.</p>
        </div>

        {/* Main Widget Grid */}
        <div className="widgets-grid">
          {/* Hero Widget - Emotional Spending */}
          <div className="widget-hero">
            <WidgetCard 
              title="Emotional Spending Insight"
              subtitle="This month's emotional spending breakdown"
              accent="primary"
              interactive={true}
              onClick={() => handleCardClick('/summary')}
            >
              <div className="emotional-spending-content">
                <div className="spending-amount number-display">${emotionalSpending}</div>
                
                {/* Pie Chart */}
                <div className="pie-chart-wrapper">
                  <EmotionPieChart data={emotionBreakdown} />
                </div>
                
                <div className="emotion-tags-row">
                  {emotionBreakdown.map((emotion, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmotionClick(emotion);
                      }}
                      className={selectedEmotion?.label === emotion.label ? 'selected' : ''}
                    >
                      <EmotionTag
                        label={emotion.label}
                        percentage={emotion.percentage}
                        color={emotion.color}
                      />
                    </div>
                  ))}
                </div>
                <div className="suggestion-box">
                  <p className="suggestion-text muted-text">
                    💡 Most of your emotional spending happens when you're stressed. Try taking a 5-minute break before making purchases.
                  </p>
                </div>
              </div>
            </WidgetCard>
          </div>

          {/* Secondary Widgets Grid */}
          <div className="widgets-row">
            {/* Invisible Spending Widget */}
            <div className="widget-item">
              <WidgetCard 
                title="Invisible Spending"
                subtitle="Small purchases that add up"
                accent="danger"
                interactive={true}
                collapsible={true}
              >
                <TransactionList items={invisibleSpending} />
              </WidgetCard>
            </div>

            {/* Weekly Summary Widget */}
            <div className="widget-item">
              <WidgetCard 
                title="Weekly Summary"
                subtitle="Your progress this week"
                accent="success"
                interactive={true}
                onClick={() => handleCardClick('/summary')}
              >
                <div className="weekly-summary-content">
                  <p className="summary-text text-primary">
                    You're <span className="highlight-text">$320 behind</span> your goal.
                  </p>
                  <ul className="trigger-list">
                    <li className="muted-text">🕐 Late evening purchases increased by 40%</li>
                    <li className="muted-text">😓 Stress triggers accounted for 50% of spending</li>
                  </ul>
                  <Link to="/summary" onClick={(e) => e.stopPropagation()}>
                    <Button className="btn-primary-custom mt-3" style={{ width: '100%' }}>
                      View Detailed Summary →
                    </Button>
                  </Link>
                </div>
              </WidgetCard>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default InsightsPage;
