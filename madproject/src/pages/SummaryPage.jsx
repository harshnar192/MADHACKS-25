import { Container, Row, Col, ProgressBar } from 'react-bootstrap';
import InsightCard from '../components/InsightCard';
import { useData } from '../contexts/DataContext';
import './SummaryPage.css';

function SummaryPage() {
  const { spendingByCategory, totalSpent, emotionalTriggers, checkIns } = useData();
  
  // Calculate weekly insight based on data
  const weeklyInsight = checkIns.length > 0 
    ? "Track your emotional spending patterns to identify triggers."
    : "Start logging check-ins to see insights about your spending patterns.";
  
  // Generate coaching text based on actual data
  const coachingText = checkIns.length > 0
    ? `You've logged ${checkIns.length} check-in${checkIns.length > 1 ? 's' : ''} with a total of $${totalSpent.toLocaleString()} in emotional spending. Your primary triggers are: ${emotionalTriggers.sort((a, b) => b.count - a.count).map(t => `${t.trigger} (${t.count})`).join(', ')}. Consider setting up reminders to pause before making purchases when you notice these patterns.`
    : "Start logging your spending and emotions to get personalized insights and coaching.";

  return (
    <Container className="py-4 summary-page">
      <div className="page-header mb-4">
        <h2 className="text-primary mb-2">Summary</h2>
        <p className="muted-text">View your spending overview and key insights at a glance.</p>
      </div>

      {/* Two-column layout on desktop */}
      <Row className="g-3 mb-4">
        {/* Left Column: Spending Summary */}
        <Col md={6}>
          <InsightCard 
            title="Spending Summary"
            subtitle={`Total: $${totalSpent.toLocaleString()}`}
            accent="primary"
          >
            <div className="spending-breakdown">
              {spendingByCategory.length > 0 ? (
                spendingByCategory.map((item, index) => (
                  <div key={index} className="category-item">
                    <div className="category-header">
                      <span className="category-name text-primary">{item.category}</span>
                      <span className="category-amount text-primary">${item.amount.toLocaleString()}</span>
                    </div>
                    <ProgressBar 
                      now={item.percentage} 
                      className="category-progress"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        height: '8px',
                        borderRadius: '4px'
                      }}
                    >
                      <ProgressBar 
                        now={item.percentage} 
                        variant="primary"
                        style={{
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </ProgressBar>
                    <span className="category-percentage muted-text">{item.percentage.toFixed(1)}%</span>
                  </div>
                ))
              ) : (
                <p className="muted-text">No spending data yet. Add a check-in to see your spending breakdown.</p>
              )}
            </div>
          </InsightCard>
        </Col>

        {/* Right Column: Emotional Insights */}
        <Col md={6}>
          <InsightCard 
            title="Emotional Insights"
            subtitle="Your emotional triggers"
            accent="danger"
          >
            <div className="emotional-insights">
              {emotionalTriggers.map((item, index) => (
                <div key={index} className="trigger-item">
                  <span className="trigger-name text-primary">{item.trigger}</span>
                  <span className="trigger-count number-display">{item.count}</span>
                </div>
              ))}
              <div className="insight-highlight">
                <p className="insight-text">
                  <strong>{weeklyInsight}</strong>
                </p>
              </div>
            </div>
          </InsightCard>
        </Col>
      </Row>

      {/* Full-width coaching card */}
      <Row>
        <Col>
          <InsightCard 
            title="This Week's Coaching"
            accent="success"
          >
            <p className="coaching-text muted-text">{coachingText}</p>
          </InsightCard>
        </Col>
      </Row>
    </Container>
  );
}

export default SummaryPage;
