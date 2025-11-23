import { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import WidgetCard from '../components/WidgetCard';
import EmotionPieChart from '../components/EmotionPieChart';
import TransactionList from '../components/TransactionList';
import { useData } from '../contexts/DataContext';
import './InsightsPage.css';

function InsightsPage() {
  const navigate = useNavigate();
  const { 
    emotionalSpending, 
    emotionBreakdown, 
    invisibleSpending,
    moodBreakdown,
    checkIns,
    isLoading,
    weeklySummary
  } = useData();
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
                <div className="spending-amount number-display">
                  ${isLoading ? '0.00' : (emotionalSpending || 0).toFixed(2)}
                </div>
                
                {/* Pie Chart - Shows mood data from emotional transactions */}
                <div className="pie-chart-wrapper">
                  {isLoading ? (
                    <div className="text-center py-5">
                      <p className="muted-text">Loading mood data...</p>
                    </div>
                  ) : moodBreakdown.length > 0 ? (
                    <EmotionPieChart moodData={moodBreakdown} />
                  ) : checkIns.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="muted-text">No emotional transactions yet.</p>
                      <p className="muted-text" style={{ fontSize: '12px', marginTop: '8px' }}>
                        Start adding check-ins to see your mood patterns!
                      </p>
                </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="muted-text">No mood data available</p>
                    </div>
                  )}
                </div>
                
                <div className="suggestion-box">
                  <p className="suggestion-text muted-text">
                    💡 {isLoading ? (
                      'Loading insights...'
                    ) : moodBreakdown.length > 0 && moodBreakdown[0] ? (
                      `Most of your emotional spending happens when you're ${moodBreakdown[0].mood}. Try taking a 5-minute break before making purchases.`
                    ) : checkIns.length === 0 ? (
                      'Start tracking your emotional spending to see personalized insights!'
                    ) : (
                      'Keep tracking to see your spending patterns.'
                    )}
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
                  {isLoading ? (
                    <p className="summary-text text-primary">Loading summary...</p>
                  ) : (
                    <>
                  <p className="summary-text text-primary">
                        {checkIns.length > 0 ? (
                          <>You've made <span className="highlight-text">{checkIns.length} emotional purchases</span> this month.</>
                        ) : (
                          <>Start tracking your emotional spending!</>
                        )}
                  </p>
                  <ul className="trigger-list">
                        {weeklySummary.lateEveningPercentage > 0 && (
                          <li className="muted-text">
                            🕐 Late evening purchases (8pm-6am) account for {weeklySummary.lateEveningPercentage}% of your spending
                          </li>
                        )}
                        {weeklySummary.topMoodTrigger && (
                          <li className="muted-text">
                            😓 {weeklySummary.topMoodTrigger.charAt(0).toUpperCase() + weeklySummary.topMoodTrigger.slice(1).replace('_', ' ')} triggers accounted for {weeklySummary.topMoodPercentage}% of spending
                          </li>
                        )}
                        {!weeklySummary.topMoodTrigger && moodBreakdown.length === 0 && (
                          <li className="muted-text">No mood data available</li>
                        )}
                  </ul>
                    </>
                  )}
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
