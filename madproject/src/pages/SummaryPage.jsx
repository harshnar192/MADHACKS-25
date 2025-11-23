import { useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import InsightCard from '../components/InsightCard';
import { useData } from '../contexts/DataContext';
import { generateSummary } from '../services/api';
import './SummaryPage.css';

function SummaryPage() {
  const navigate = useNavigate();
  const [aiCoaching, setAiCoaching] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState('supportive_friend');
  
  // Helper to convert trigger name back to mood format
  const getMoodFromTrigger = (trigger) => {
    return trigger.toLowerCase().replace(' ', '_');
  };
  
  // Handle clicking on trigger count to navigate to transactions
  const handleTriggerClick = (trigger) => {
    const mood = getMoodFromTrigger(trigger);
    navigate('/transactions', { 
      state: { 
        highlightMood: mood,
        filterByMood: mood 
      } 
    });
  };

  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Prepare data for the backend using real impulsive purchase data
      const totalSpending = emotionalSpending || totalSpent || 0;
      const categoryData = spendingByCategory.reduce((acc, item) => {
        acc[item.category.toLowerCase().replace(' ', '_')] = item.amount;
        return acc;
      }, {});
      
      const data = {
        goals: [
          { description: "Keep food delivery under $75/week" },
          { description: "Limit bar spending to $100/week" }
        ],
        spending: {
          total_spent: totalSpending,
          by_category: categoryData
        },
        goalProgress: spendingByCategory.reduce((acc, item) => {
          acc[item.category.toLowerCase().replace(' ', '_')] = {
            goal: 500,
            actual: item.amount,
            percent: item.percentage
          };
          return acc;
        }, {}),
        voiceEntries: [],
        invisibleSpending: {
          unlogged_transactions: checkIns.filter(tx => (tx.amountValue || 0) < 50).length,
          unlogged_amount: checkIns.filter(tx => (tx.amountValue || 0) < 50).reduce((sum, tx) => sum + (tx.amountValue || 0), 0)
        },
        patterns: emotionalTriggers.reduce((acc, trigger, idx) => {
          acc[`pattern_${idx}`] = {
            pattern: trigger.trigger,
            occurrences: trigger.count,
            total_cost: (emotionalSpending || 0) * (trigger.count / (checkIns.length || 1)) || 50 * trigger.count
          };
          return acc;
        }, {})
      };

      const result = await generateSummary(selectedPersona, data);
      setAiCoaching(result.summary);
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
      setError('Unable to generate AI coaching summary. The backend service may be unavailable.');
    } finally {
      setIsGenerating(false);
    }
  };
  const { 
    spendingByCategory, 
    totalSpent, 
    emotionalTriggers, 
    checkIns,
    isLoading,
    emotionalSpending
  } = useData();
  
  // Calculate weekly insight based on data
  const weeklyInsight = checkIns.length > 0 
    ? "Track your emotional spending patterns to identify triggers."
    : "Start logging check-ins to see insights about your spending patterns.";
  
  // Generate coaching text based on actual data
  const coachingText = checkIns.length > 0
    ? `You've logged ${checkIns.length} emotional purchase${checkIns.length > 1 ? 's' : ''} with a total of $${(emotionalSpending || totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in emotional spending. ${emotionalTriggers.length > 0 ? `Your primary triggers are: ${emotionalTriggers.slice(0, 3).map(t => `${t.trigger} (${t.count})`).join(', ')}.` : ''} Consider setting up reminders to pause before making purchases when you notice these patterns.`
    : "Start logging your spending and emotions to get personalized insights and coaching.";
  
  // Get top overspending category
  const topCategory = spendingByCategory.length > 0 ? spendingByCategory[0] : null;

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
            subtitle={isLoading ? "Loading..." : `Total: $${(emotionalSpending || totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            accent="primary"
          >
            <div className="spending-breakdown">
              {isLoading ? (
                <p className="muted-text">Loading spending data...</p>
              ) : spendingByCategory.length > 0 ? (
                <>
                  {topCategory && topCategory.percentage > 50 && (
                    <div className="alert alert-warning mb-3" style={{ 
                      fontSize: '13px', 
                      padding: '10px 14px', 
                      backgroundColor: 'rgba(251, 191, 36, 0.15)', 
                      border: '1px solid rgba(251, 191, 36, 0.4)', 
                      borderRadius: '6px',
                      color: '#ffffff'
                    }}>
                      ⚠️ <strong style={{ color: '#ffffff' }}>Overspending Alert:</strong> You're spending {topCategory.percentage.toFixed(1)}% of your total on <strong style={{ color: '#ffffff' }}>{topCategory.category}</strong> (${topCategory.amount.toFixed(2)})
                    </div>
                  )}
                  {spendingByCategory.map((item, index) => (
                    <div key={index} className="category-item">
                      <div className="category-header">
                        <span className="category-name">{item.category}</span>
                        <div className="category-right">
                          <span className="category-amount">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="category-percentage">{item.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
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
              {isLoading ? (
                <p className="muted-text">Loading emotional triggers...</p>
              ) : emotionalTriggers.length > 0 ? (
                <>
              {emotionalTriggers.map((item, index) => (
                <div key={index} className="trigger-item">
                  <span className="trigger-name">{item.trigger}</span>
                  <span 
                    className="trigger-count trigger-count-clickable" 
                    onClick={() => handleTriggerClick(item.trigger)}
                    title={`Click to view ${item.count} ${item.trigger.toLowerCase()} purchases`}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
              <div className="insight-highlight">
                <p className="insight-text">
                  <strong>{weeklyInsight}</strong>
                </p>
              </div>
                </>
              ) : (
                <p className="muted-text">No emotional trigger data available.</p>
              )}
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
            {error && (
              <Alert variant="warning" className="mb-3">
                {error}
              </Alert>
            )}
            
            <div className="mb-3">
              <label className="text-primary mb-2">Choose your coach's tone:</label>
              <div className="btn-group w-100" role="group">
                <Button
                  variant={selectedPersona === 'supportive_friend' ? 'primary' : 'outline-primary'}
                  onClick={() => setSelectedPersona('supportive_friend')}
                  size="sm"
                >
                  Supportive Friend
                </Button>
                <Button
                  variant={selectedPersona === 'stern_coach' ? 'primary' : 'outline-primary'}
                  onClick={() => setSelectedPersona('stern_coach')}
                  size="sm"
                >
                  Stern Coach
                </Button>
                <Button
                  variant={selectedPersona === 'neutral_advisor' ? 'primary' : 'outline-primary'}
                  onClick={() => setSelectedPersona('neutral_advisor')}
                  size="sm"
                >
                  Neutral Advisor
                </Button>
              </div>
            </div>

            <p className="coaching-text muted-text">
              {aiCoaching || coachingText}
            </p>

            <div className="mt-3">
              <Button
                className="btn-primary-custom"
                onClick={handleGenerateAISummary}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generating AI Summary...
                  </>
                ) : (
                  '✨ Generate AI Coaching Summary'
                )}
              </Button>
            </div>
          </InsightCard>
        </Col>
      </Row>
    </Container>
  );
}

export default SummaryPage;
