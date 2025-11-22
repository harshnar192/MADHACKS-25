import { useState } from 'react';
import { Container, Modal, Form, Button } from 'react-bootstrap';
import GoalProgressCard from '../components/GoalProgressCard';
import InsightCard from '../components/InsightCard';
import { monthlyGoal, emotionalBlockers, blockerNote } from '../mockData';
import './GoalsPage.css';

function GoalsPage() {
  const [showGuardrailModal, setShowGuardrailModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // TODO: Implement guardrail functionality when backend is integrated
  const handleGuardrailModalClose = () => setShowGuardrailModal(false);
  const handleGuardrailModalShow = () => setShowGuardrailModal(true);

  // TODO: Implement goal adjustment functionality when backend is integrated
  const handleGoalModalClose = () => setShowGoalModal(false);
  const handleGoalModalShow = () => setShowGoalModal(true);

  return (
    <Container className="py-4 goals-page">
      <div className="page-header mb-4">
        <h2 className="text-primary mb-2">Goals</h2>
        <p className="muted-text">Set and track your financial goals and spending targets.</p>
      </div>

      {/* Main Goal Progress Card */}
      <div className="mb-4">
        <GoalProgressCard
          goalLabel={monthlyGoal.label}
          current={monthlyGoal.current}
          target={monthlyGoal.target}
        />
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
              className="btn-secondary-custom"
              onClick={handleGuardrailModalShow}
            >
              Set New Guardrail
            </Button>
            <Button 
              className="btn-primary-custom"
              onClick={handleGoalModalShow}
            >
              Adjust Goal
            </Button>
          </div>
        </div>
      </InsightCard>

      {/* Guardrail Modal */}
      <Modal 
        show={showGuardrailModal} 
        onHide={handleGuardrailModalClose}
        centered
        className="goals-modal"
      >
        <Modal.Header closeButton className="goals-modal-header">
          <Modal.Title>Set New Guardrail</Modal.Title>
        </Modal.Header>
        <Modal.Body className="goals-modal-body">
          <p className="muted-text">
            Guardrails help you pause before emotional spending. 
            This feature will be available when the backend is integrated.
          </p>
          <p className="muted-text mt-3">
            TODO: Add form fields for guardrail creation (e.g., spending limit, trigger phrases, notification settings).
          </p>
          <div className="goals-modal-actions">
            <Button 
              className="btn-primary-custom"
              onClick={handleGuardrailModalClose}
            >
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Adjust Goal Modal */}
      <Modal 
        show={showGoalModal} 
        onHide={handleGoalModalClose}
        centered
        className="goals-modal"
      >
        <Modal.Header closeButton className="goals-modal-header">
          <Modal.Title>Adjust Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body className="goals-modal-body">
          <p className="muted-text">
            Modify your monthly savings goal. Changes will be saved when backend is integrated.
          </p>
          <p className="muted-text mt-3">
            TODO: Add form fields for goal adjustment (e.g., new target amount, timeline).
          </p>
          <div className="goals-modal-actions">
            <Button 
              className="btn-primary-custom"
              onClick={handleGoalModalClose}
            >
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default GoalsPage;
