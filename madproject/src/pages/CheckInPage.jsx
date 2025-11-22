import { useState } from 'react';
import { Container, Modal, Form, Button, Row } from 'react-bootstrap';
import InsightCard from '../components/InsightCard';
import TransactionList from '../components/TransactionList';
import { recentCheckIns } from '../mockData';
import './CheckInPage.css';

function CheckInPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    explanation: ''
  });

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // TODO: Replace with real API call when backend is integrated
  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: In real app, this would save the data to backend
    console.log('Check-in submitted:', formData);
    handleCloseModal();
    // Reset form
    setFormData({
      amount: '',
      merchant: '',
      explanation: ''
    });
  };

  return (
    <Container className="py-4 check-in-page">
      <div className="page-header mb-4">
        <h2 className="text-primary mb-2">Check-in</h2>
        <p className="muted-text">Log how you're feeling and track your spending decisions.</p>
      </div>

      {/* Top Card: Unexpected Spending */}
      <Row className="mb-4">
        <Container className="px-0">
          <InsightCard title="Unexpected Spending?" accent="primary">
            <div className="check-in-card-content">
              <div className="check-in-icon">❓</div>
              <p className="check-in-prompt text-primary">Tell me what happened.</p>
              <div className="check-in-buttons">
                {/* TODO: Implement voice recording when backend/speech-to-text API is integrated */}
                <Button 
                  className="btn-primary-custom check-in-btn"
                  onClick={() => alert('Voice recording coming soon!')}
                >
                  🎤 Record Voice
                </Button>
                <Button 
                  className="btn-secondary-custom check-in-btn"
                  onClick={handleShowModal}
                >
                  ⌨️ Type Explanation
                </Button>
              </div>
            </div>
          </InsightCard>
        </Container>
      </Row>

      {/* Recent Check-Ins */}
      <Row>
        <Container className="px-0">
          <InsightCard 
            title="Recent Check-Ins" 
            subtitle="Your recent spending explanations"
            accent="success"
          >
            <TransactionList items={recentCheckIns} />
            <p className="check-in-note muted-text">
              These explanations will be used to understand your emotional triggers (no real bank connection yet).
            </p>
          </InsightCard>
        </Container>
      </Row>

      {/* Modal for Typing Explanation */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        centered
        className="check-in-modal"
      >
        <Modal.Header closeButton className="check-in-modal-header">
          <Modal.Title>Add Spending Explanation</Modal.Title>
        </Modal.Header>
        <Modal.Body className="check-in-modal-body">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-primary">Amount</Form.Label>
              <Form.Control
                type="text"
                name="amount"
                placeholder="$0.00"
                value={formData.amount}
                onChange={handleInputChange}
                className="check-in-form-control"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-primary">Merchant / Category</Form.Label>
              <Form.Control
                type="text"
                name="merchant"
                placeholder="e.g., Starbucks, Amazon"
                value={formData.merchant}
                onChange={handleInputChange}
                className="check-in-form-control"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-primary">Explanation</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="explanation"
                placeholder="How were you feeling? What led to this purchase?"
                value={formData.explanation}
                onChange={handleInputChange}
                className="check-in-form-control"
                required
              />
            </Form.Group>

            <div className="check-in-modal-actions">
              <Button 
                type="button"
                variant="secondary"
                className="btn-secondary-custom"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="btn-primary-custom"
              >
                Save Check-in
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default CheckInPage;
