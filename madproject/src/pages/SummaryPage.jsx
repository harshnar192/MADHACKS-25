import { useState, useRef } from 'react';
import { Container, Row, Col, ProgressBar, Button, Spinner, Alert } from 'react-bootstrap';
import InsightCard from '../components/InsightCard';
import { useData } from '../contexts/DataContext';
import { 
  spendingByCategory, 
  totalSpent, 
  emotionalTriggers, 
  weeklyInsight,
  coachingText 
} from '../mockData';
import { generateSummary, ttsText } from '../services/api';
import './SummaryPage.css';

function SummaryPage() {
  const [aiCoaching, setAiCoaching] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState(null); 
  const [error, setError] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState('supportive_friend');
  const [audioUrl, setAudioUrl] = useState(null); 
  const audioRef = useRef(null); 

  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Prepare data for the backend
      const data = {
        goals: [
          { description: "Keep food delivery under $75/week" },
          { description: "Limit bar spending to $100/week" }
        ],
        spending: {
          total_spent: totalSpent,
          by_category: spendingByCategory.reduce((acc, item) => {
            acc[item.category.toLowerCase()] = item.amount;
            return acc;
          }, {})
        },
        goalProgress: spendingByCategory.reduce((acc, item) => {
          acc[item.category.toLowerCase()] = {
            goal: 500,
            actual: item.amount,
            percent: item.percentage
          };
          return acc;
        }, {}),
        voiceEntries: [],
        invisibleSpending: {
          unlogged_transactions: 5,
          unlogged_amount: 150
        },
        patterns: emotionalTriggers.reduce((acc, trigger, idx) => {
          acc[`pattern_${idx}`] = {
            pattern: trigger.trigger,
            occurrences: trigger.count,
            total_cost: 50 * trigger.count
          };
          return acc;
        }, {})
      };

      const result = await generateSummary(selectedPersona, data);
      // const result = {"summary": "Good morning world! Good morning friend!"};
      setAiCoaching(result.summary);
      console.log(result.summary); 
      const blob = await ttsText(result.summary); 
      const url = URL.createObjectURL(blob); 
      setAudioUrl(url); 
      console.log(audioUrl); 
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
      setError('Unable to generate AI coaching summary. The backend service may be unavailable.');
    } finally {
      setIsGenerating(false);
    }
  };
  const { spendingByCategory, totalSpent, emotionalTriggers, checkIns } = useData();
  
  // Calculate weekly insight based on data
  const weeklyInsight = checkIns.length > 0 
    ? "Track your emotional spending patterns to identify triggers."
    : "Start logging check-ins to see insights about your spending patterns.";
  
  // Generate coaching text based on actual data
  const coachingText = checkIns.length > 0
    ? `You've logged ${checkIns.length} check-in${checkIns.length > 1 ? 's' : ''} with a total of $${totalSpent.toLocaleString()} in emotional spending. Your primary triggers are: ${emotionalTriggers.sort((a, b) => b.count - a.count).map(t => `${t.trigger} (${t.count})`).join(', ')}. Consider setting up reminders to pause before making purchases when you notice these patterns.`
    : "Start logging your spending and emotions to get personalized insights and coaching.";

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play(); 
    }
  }

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

            {audioUrl && (
              <>
                <button onClick={handlePlay}>▶ Play</button>
                <audio ref={audioRef} src={audioUrl} />
              </>
            )}

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
