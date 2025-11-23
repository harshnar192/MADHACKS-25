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
    loadingImpulsive,
    impulsivePurchases,
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
                  ${loadingImpulsive ? '0.00' : (emotionalSpending || 0).toFixed(2)}
                </div>
                
                {/* Pie Chart - ALWAYS use mood data from impulsive.json */}
                <div className="pie-chart-wrapper">
                  {loadingImpulsive ? (
                    <div className="text-center py-5">
                      <p className="muted-text">Loading mood data...</p>
                    </div>
                  ) : moodBreakdown.length > 0 ? (
                    <EmotionPieChart moodData={moodBreakdown} />
                  ) : impulsivePurchases.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="muted-text">Unable to load impulsive purchases data.</p>
                      <p className="muted-text" style={{ fontSize: '12px', marginTop: '8px' }}>
                        Please ensure the server is running and the /api/impulsive endpoint is available.
                      </p>
                </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="muted-text">No mood data available from impulsive purchases</p>
                    </div>
                  )}
                </div>
                
                <div className="suggestion-box">
                  <p className="suggestion-text muted-text">
                    💡 {loadingImpulsive ? (
                      'Loading insights...'
                    ) : moodBreakdown.length > 0 && moodBreakdown[0] ? (
                      `Most of your emotional spending happens when you're ${moodBreakdown[0].mood}. Try taking a 5-minute break before making purchases.`
                    ) : impulsivePurchases.length === 0 ? (
                      'Unable to load data. Please restart the server to enable the /api/impulsive endpoint.'
                    ) : (
                      'No mood data available from impulsive purchases.'
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
                  {loadingImpulsive ? (
                    <p className="summary-text text-primary">Loading summary...</p>
                  ) : (
                    <>
                  <p className="summary-text text-primary">
                        {impulsivePurchases.length > 0 ? (
                          <>You've made <span className="highlight-text">{impulsivePurchases.length} impulse purchases</span> this month.</>
                        ) : (
                          <>You're <span className="highlight-text">$320 behind</span> your goal.</>
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
