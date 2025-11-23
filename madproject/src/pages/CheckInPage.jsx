import { useState } from 'react';
import { Container, Modal, Form, Button, Row, Alert } from 'react-bootstrap';
import InsightCard from '../components/InsightCard';
import TransactionList from '../components/TransactionList';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useData } from '../contexts/DataContext';
import { parseEntry, transcribeAudio, matchTransaction, saveEmotionalTransaction } from '../services/api';
import './CheckInPage.css';

function CheckInPage() {
  const { refreshData, recentCheckIns, isLoading } = useData();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    explanation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [matchInfo, setMatchInfo] = useState(null);
  const [pendingSave, setPendingSave] = useState(null); // Store data for confirmation

  // Voice recording hook
  const {
    isRecording,
    audioBlob,
    recordingTime,
    recordingTimeSeconds,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useVoiceRecorder();

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const saveToDatabase = async (data) => {
    try {
      await saveEmotionalTransaction(data);
      
      // Refresh data from MongoDB to update UI (don't let refresh errors break the flow)
      try {
        await refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh data, but save succeeded:', refreshError);
      }
      
      setSubmitSuccess(true);
      clearRecording();
      setPendingSave(null);
      setMatchInfo(null);
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save to database:', error);
      setSubmitError('Failed to save transaction. Please try again.');
    }
  };

  const handleConfirmMatch = async (confirmed) => {
    if (!pendingSave) return;

    const dataToSave = {
      ...pendingSave,
      user_confirmed: confirmed,
      needs_correction: !confirmed
    };

    // If user confirms correction, update merchant to actual bank merchant
    if (confirmed && pendingSave.matched_transaction) {
      dataToSave.merchant = pendingSave.matched_transaction.merchant;
    }

    await saveToDatabase(dataToSave);
  };

  const handleVoiceSubmit = async () => {
    if (!audioBlob) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Transcribe the audio using Fish Audio
      console.log('🎤 Transcribing audio...');
      const transcript = await transcribeAudio(audioBlob, recordingTime);
      console.log('✅ Transcription:', transcript);
      
      // Parse the transcribed text
      console.log('🤖 Parsing with AI...');
      const parsedResult = await parseEntry(transcript);
      console.log('✅ Parsed result:', parsedResult);
      
      // Prepare base data - preserve what user actually said
      const baseData = {
        user_id: 'default', // TODO: Replace with real user ID from auth
        amount: parsedResult.amount || 0,
        merchant: parsedResult.merchant || parsedResult.category?.replace('_', ' ') || 'Unknown',
        original_merchant: parsedResult.merchant, // Keep what user said for "No" button
        category: parsedResult.category,
        emotion: parsedResult.emotion || 'neutral',
        context: parsedResult.context,
        transcript: transcript,
        entry_time: new Date().toISOString()
      };
      
      // Try to match with bank transactions
      try {
        console.log('🔍 Matching with bank transactions...');
        const matchResult = await matchTransaction(parsedResult, transcript);
        console.log('✅ Match result:', matchResult);
        
        if (matchResult.matched && matchResult.transaction) {
          const enrichedData = {
            ...baseData,
            transaction_id: matchResult.transaction.transaction_id,
            matched_transaction: matchResult.transaction,
            match_confidence: matchResult.confidence,
            needs_correction: matchResult.needs_correction || false
          };

          // If needs correction, show prompt and wait for user
          if (matchResult.needs_correction && matchResult.correction_prompt) {
            setMatchInfo(matchResult);
            setPendingSave(enrichedData);
          } else {
            // Clean match - auto-save (use bank's merchant name)
            await saveToDatabase({
              ...enrichedData,
              merchant: matchResult.transaction.merchant
            });
          }
        } else {
          // No match OR skeptical - show message and wait for user confirmation
          const message = matchResult.skeptical_message || "I couldn't find a matching transaction — I'm a bit confused. Could you try again or type it?";
          setMatchInfo({ matched: false, skeptical_message: message });
          setPendingSave(baseData);
        }
      } catch (matchError) {
        console.warn('⚠️ Transaction matching failed; asking user instead of auto-saving:', matchError);
        setMatchInfo({ matched: false, skeptical_message: "I couldn't find a matching transaction — I'm a bit confused. Could you try again or type it?" });
        setPendingSave(baseData);
      }
    } catch (error) {
      console.error('Failed to process voice recording:', error);
      setSubmitError(error.message || 'Failed to process your voice recording. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create a transcript from the form data
      const transcript = `Spent ${formData.amount} at ${formData.merchant}. ${formData.explanation}`;
      
      // Parse the entry using the backend API
      const parsedResult = await parseEntry(transcript);
      console.log('Parsed entry:', parsedResult);

      // Prepare base data
      const baseData = {
        user_id: 'default', // TODO: Replace with real user ID from auth
        amount: parsedResult.amount || parseFloat(formData.amount.replace(/[^0-9.]/g, '')) || 0,
        merchant: formData.merchant || parsedResult.category?.replace('_', ' ') || 'Unknown',
        category: parsedResult.category,
        emotion: parsedResult.emotion || 'neutral',
        context: formData.explanation || parsedResult.context,
        transcript: transcript,
        entry_time: new Date().toISOString()
      };

      // Try to match with bank transactions
      try {
        console.log('🔍 Matching with bank transactions...');
        const matchResult = await matchTransaction(parsedResult, transcript);
        console.log('✅ Match result:', matchResult);
        
        if (matchResult.matched && matchResult.transaction) {
          const enrichedData = {
            ...baseData,
            transaction_id: matchResult.transaction.transaction_id,
            matched_transaction: matchResult.transaction,
            match_confidence: matchResult.confidence,
            needs_correction: matchResult.needs_correction || false
          };

          // If needs correction, show prompt and wait for user
          if (matchResult.needs_correction && matchResult.correction_prompt) {
            setMatchInfo(matchResult);
            setPendingSave(enrichedData);
            handleCloseModal();
          } else {
            // Clean match - auto-save
            await saveToDatabase(enrichedData);
            handleCloseModal();
            setFormData({
              amount: '',
              merchant: '',
              explanation: ''
            });
          }
        } else {
          // No match OR skeptical - show message and wait for user confirmation
          const message = matchResult.skeptical_message || "I couldn't find a matching transaction — I'm a bit confused. Could you try again or type it?";
          setMatchInfo({ matched: false, skeptical_message: message });
          setPendingSave(baseData);
          handleCloseModal();
        }
      } catch (matchError) {
        console.warn('⚠️ Transaction matching failed, saving without match:', matchError);
        await saveToDatabase(baseData);
        handleCloseModal();
        setFormData({
          amount: '',
          merchant: '',
          explanation: ''
        });
      }
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      setSubmitError('Failed to process your check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4 check-in-page">
      <div className="page-header mb-4">
        <h2 className="text-primary mb-2">Check-in</h2>
        <p className="muted-text">Log how you're feeling and track your spending decisions.</p>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <Alert variant="success" onClose={() => setSubmitSuccess(false)} dismissible>
          Check-in submitted successfully!
        </Alert>
      )}
      {submitError && (
        <Alert variant="danger" onClose={() => setSubmitError(null)} dismissible>
          {submitError}
        </Alert>
      )}
      {matchInfo && (
        <>
          {matchInfo.skeptical_message && (
            <Alert variant="warning" onClose={() => { setMatchInfo(null); setPendingSave(null); }} dismissible>
              <div>
                <strong>🤨 Hold up...</strong>
                <br />
                {matchInfo.skeptical_message}
              </div>
            </Alert>
          )}
          {matchInfo.needs_correction && matchInfo.correction_prompt && (
            <Alert variant="info" className="d-flex justify-content-between align-items-start">
              <div>
                <strong>🤔 Wait, did you mean...</strong>
                <br />
                {matchInfo.correction_prompt}
              </div>
              <div className="d-flex gap-2 ms-3">
                <Button 
                  size="sm" 
                  variant="success"
                  onClick={() => handleConfirmMatch(true)}
                  disabled={isSubmitting}
                >
                  Yes, that's it
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-danger"
                  onClick={() => {
                    // User said No — do NOT save. Clear the pending state.
                    setMatchInfo(null);
                    setPendingSave(null);
                  }}
                  disabled={isSubmitting}
                >
                  No, I meant what I said
                </Button>
              </div>
            </Alert>
          )}
          {matchInfo.matched && !matchInfo.needs_correction && !matchInfo.skeptical_message && (
            <Alert variant="success" onClose={() => setMatchInfo(null)} dismissible>
              <strong>✅ Transaction Matched!</strong>
              <br />
              Matched to: <strong>{matchInfo.transaction?.merchant || 'Transaction'}</strong> - ${matchInfo.transaction?.amount}
            </Alert>
          )}
        </>
      )}

      {/* Top Card: Unexpected Spending */}
      <Row className="mb-4">
        <Container className="px-0">
          <InsightCard title="Unexpected Spending?" accent="primary">
            <div className="check-in-card-content">
              <div className="check-in-icon">❓</div>
              <p className="check-in-prompt text-primary">Tell me what happened.</p>
              
              {/* Voice Recording Section */}
              <div className="voice-recording-section">
                <div className="recording-controls">
                  <Button 
                    className={`check-in-btn ${isRecording ? 'btn-recording' : 'btn-primary-custom'}`}
                    onClick={handleVoiceToggle}
                  >
                    {isRecording ? (
                      <>
                        <span className="recording-indicator">⏹️</span> Stop Recording
                      </>
                    ) : (
                      <>
                        <span>🎤</span> Record Voice
                      </>
                    )}
                    {/* Always show timer when recording */}
                    {isRecording && (
                      <span className="recording-timer">{recordingTime}</span>
                    )}
                  </Button>
                  
                  {isRecording && (
                    <div className="recording-status">
                      <span className="recording-dot"></span>
                      <span className="recording-text">Recording...</span>
                      <span className="recording-time-display">{recordingTime}</span>
                    </div>
                  )}
                  
                  {recordingError && (
                    <div className="recording-error">
                      {recordingError}
                    </div>
                  )}
                  
                  {audioBlob && !isRecording && (
                    <div className="recording-success">
                      <span className="success-icon">✅</span>
                      <span>Recording complete! ({recordingTime}, {Math.round(audioBlob.size / 1024)} KB)</span>
                      <Button 
                        className="btn-primary-custom"
                        onClick={handleVoiceSubmit}
                        size="sm"
                        style={{ marginLeft: '12px' }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Submit Voice'}
                      </Button>
                      <Button 
                        className="btn-secondary-custom"
                        onClick={clearRecording}
                        size="sm"
                        style={{ marginLeft: '8px' }}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="check-in-buttons">
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
            {isLoading ? (
              <p className="text-center text-muted">Loading your check-ins...</p>
            ) : recentCheckIns.length === 0 ? (
              <p className="text-center text-muted">No check-ins yet. Start by recording or typing your first entry above!</p>
            ) : (
              <TransactionList items={recentCheckIns} />
            )}
            <p className="check-in-note muted-text">
              Check-ins are synced with your MongoDB database.
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
