import { useState, useMemo, useEffect } from 'react';
import { Container, Modal, Form, Button } from 'react-bootstrap';
import GoalProgressCard from '../components/GoalProgressCard';
import InsightCard from '../components/InsightCard';
import { useData } from '../contexts/DataContext';
import { getGoals, createGoal, updateGoal } from '../services/api';
import './GoalsPage.css';

function GoalsPage() {
  const { checkIns, emotionalSpending, monthlyIncome } = useData();
  const [goals, setGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

  // Fetch goals on mount
  useEffect(() => {
    async function loadGoals() {
      try {
        setIsLoadingGoals(true);
        const response = await getGoals('default');
        setGoals(response.goals || []);
      } catch (error) {
        console.error('Failed to load goals:', error);
      } finally {
        setIsLoadingGoals(false);
      }
    }
    loadGoals();
  }, []);

  // Get primary savings goal (first goal or default)
  const primaryGoal = goals[0] || {
    title: 'Save for a Car',
    target_amount: 5000,
    current_amount: 0,
    deadline: new Date('2026-06-30'),
    description: 'Building savings for a new car',
  };

  // Calculate monthly savings (monthlyIncome comes from DataContext now)
  const netSavings = Math.max(0, (monthlyIncome || 0) - emotionalSpending);
  
  // Calculate progress toward goal
  const totalSaved = primaryGoal.current_amount + netSavings;
  const percentComplete = (totalSaved / primaryGoal.target_amount) * 100;
  
  // Check if on track
  const daysUntilDeadline = Math.max(0, Math.ceil((new Date(primaryGoal.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(1, daysUntilDeadline / 30);
  const neededPerMonth = (primaryGoal.target_amount - primaryGoal.current_amount) / monthsRemaining;
  const isOnTrack = netSavings >= neededPerMonth;
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    target_amount: 5000,
    deadline: '',
    description: '',
  });
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // Calculate emotional blockers from check-ins
  const emotionalBlockers = useMemo(() => {
    const blockers = {};
    checkIns.forEach(checkIn => {
      const note = (checkIn.note || '').toLowerCase();
      if (note.includes('deserved') || note.includes('deserve')) {
        blockers['I deserved it'] = (blockers['I deserved it'] || 0) + 1;
      }
      if (note.includes('tired') || note.includes('too tired')) {
        blockers['Too tired to cook'] = (blockers['Too tired to cook'] || 0) + 1;
      }
      if (note.includes('just this once') || note.includes('one time')) {
        blockers['Just this once'] = (blockers['Just this once'] || 0) + 1;
      }
    });

    return Object.entries(blockers).map(([phrase, count]) => ({
      phrase,
      count
    })).sort((a, b) => b.count - a.count);
  }, [checkIns]);

  const blockerNote = emotionalBlockers.length > 0
    ? "These patterns currently block your savings goal."
    : "No emotional blockers detected yet. Keep tracking to identify patterns.";

  // Goal modal handlers
  const handleGoalModalClose = () => {
    setShowGoalModal(false);
    setGoalFormData({
      title: '',
      target_amount: 5000,
      deadline: '',
      description: '',
    });
  };
  
  const handleGoalModalShow = () => {
    // Pre-fill with existing goal if available
    if (primaryGoal && primaryGoal._id) {
      setGoalFormData({
        title: primaryGoal.title || '',
        target_amount: primaryGoal.target_amount || 5000,
        deadline: primaryGoal.deadline ? new Date(primaryGoal.deadline).toISOString().split('T')[0] : '',
        description: primaryGoal.description || '',
      });
    }
    setShowGoalModal(true);
  };

  const handleGoalFormChange = (e) => {
    const { name, value } = e.target;
    setGoalFormData(prev => ({
      ...prev,
      [name]: name === 'target_amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSaveGoal = async () => {
    try {
      setIsSavingGoal(true);
      
      if (primaryGoal._id) {
        // Update existing goal
        await updateGoal(primaryGoal._id, goalFormData);
      } else {
        // Create new goal
        await createGoal({
          user_id: 'default',
          ...goalFormData,
        });
      }

      // Refresh goals
      const response = await getGoals('default');
      setGoals(response.goals || []);
      
      handleGoalModalClose();
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal. Please try again.');
    } finally {
      setIsSavingGoal(false);
    }
  };

  return (
    <Container className="py-4 goals-page">
      <div className="page-header mb-4">
        <h2 className="text-primary mb-2">Goals</h2>
        <p className="muted-text">Set and track your financial goals and spending targets.</p>
      </div>

      {/* Main Goal Progress Card */}
      <div className="mb-4">
        {isLoadingGoals ? (
          <InsightCard title="Loading goals..." accent="primary">
            <p className="text-center muted-text">Loading your goals...</p>
          </InsightCard>
        ) : (
          <>
            <GoalProgressCard
              goalLabel={primaryGoal.title || 'Savings Goal'}
              current={totalSaved}
              target={primaryGoal.target_amount}
            />
            
            {/* Savings Breakdown */}
            <InsightCard title="This Month's Progress" accent="success" className="mt-3">
              <div className="savings-breakdown">
                {monthlyIncome === 0 && (
                  <div className="alert alert-info mb-3">
                    💡 No income detected in bank transactions. Income is calculated from Credit/Deposit transactions in your bank data.
                  </div>
                )}
                <div className="savings-row">
                  <span>Monthly Income:</span>
                  <span className="text-success fw-bold">+${(monthlyIncome || 0).toFixed(2)}</span>
                </div>
                <div className="savings-row">
                  <span>Emotional Spending:</span>
                  <span className="text-danger fw-bold">-${emotionalSpending.toFixed(2)}</span>
                </div>
                <hr />
                <div className="savings-row">
                  <span className="fw-bold">Net Savings This Month:</span>
                  <span className="text-primary fw-bold">${netSavings.toFixed(2)}</span>
                </div>
                <div className="savings-row mt-2">
                  <span className="text-muted small">Target by {new Date(primaryGoal.deadline).toLocaleDateString()}:</span>
                  <span className="text-muted small">${primaryGoal.target_amount.toFixed(2)}</span>
                </div>
                
                {/* Encouragement message */}
                <div className="encouragement-box mt-3 p-3 rounded" style={{
                  backgroundColor: isOnTrack ? '#d4edda' : '#fff3cd',
                  border: `1px solid ${isOnTrack ? '#c3e6cb' : '#ffeaa7'}`
                }}>
                  {isOnTrack ? (
                    <>
                      <p className="mb-1 fw-bold text-success">🎉 Great job! You're on track!</p>
                      <p className="mb-0 small text-muted">
                        You need to save ${neededPerMonth.toFixed(2)}/month and you're saving ${netSavings.toFixed(2)} this month.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mb-1 fw-bold text-warning">⚠️ Need to adjust spending</p>
                      <p className="mb-0 small text-muted">
                        To reach your goal, you need to save ${neededPerMonth.toFixed(2)}/month. 
                        Currently saving ${netSavings.toFixed(2)}. Try reducing emotional purchases!
                      </p>
                    </>
                  )}
                </div>
              </div>
            </InsightCard>
          </>
        )}
      </div>

      {/* Emotional Blockers Card */}
      <InsightCard
        title="Emotional Blockers"
        subtitle="Recurring phrases that impact your goals"
        accent="danger"
      >
        <div className="blockers-list">
          {emotionalBlockers.map((blocker, index) => (
            <div key={index} className="blocker-item">
              <span className="blocker-phrase text-primary">"{blocker.phrase}"</span>
              <span className="blocker-count text-primary">{blocker.count}x</span>
            </div>
          ))}
          <p className="blocker-note muted-text">{blockerNote}</p>
          <div className="blocker-actions">
            <Button 
              className="btn-primary-custom"
              onClick={handleGoalModalShow}
            >
              Adjust Goal
            </Button>
          </div>
        </div>
      </InsightCard>

      {/* Adjust Goal Modal */}
      <Modal 
        show={showGoalModal} 
        onHide={handleGoalModalClose}
        centered
        className="goals-modal"
      >
        <Modal.Header closeButton className="goals-modal-header">
          <Modal.Title>{primaryGoal._id ? 'Adjust Goal' : 'Create New Goal'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="goals-modal-body">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Goal Title</Form.Label>
              <Form.Control 
                type="text"
                name="title"
                value={goalFormData.title}
                onChange={handleGoalFormChange}
                placeholder="e.g., Save for a Car"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Amount ($)</Form.Label>
              <Form.Control 
                type="number"
                name="target_amount"
                value={goalFormData.target_amount}
                onChange={handleGoalFormChange}
                placeholder="5000"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Date</Form.Label>
              <Form.Control 
                type="date"
                name="deadline"
                value={goalFormData.deadline}
                onChange={handleGoalFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control 
                type="text"
                name="description"
                value={goalFormData.description}
                onChange={handleGoalFormChange}
                placeholder="e.g., Building savings for a new car"
              />
            </Form.Group>
          </Form>

          <div className="goals-modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button 
              className="btn-secondary-custom"
              onClick={handleGoalModalClose}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button 
              className="btn-primary-custom"
              onClick={handleSaveGoal}
              disabled={isSavingGoal}
              style={{ flex: 1 }}
            >
              {isSavingGoal ? 'Saving...' : 'Save Goal'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default GoalsPage;
