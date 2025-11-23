import { useState } from 'react';
import { Container, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import VoiceBubble from '../components/VoiceBubble';
import { initialMessages } from '../mockData';
import { parseEntry } from '../services/api';
import './VoicePage.css';

function VoicePage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceRecord = () => {
    // Voice recording functionality - to be implemented with Web Speech API
    alert('Voice recording feature coming soon! For now, please type your message.');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userInput = inputText.trim();
    
    // Add user message immediately
    const newUserMessage = {
      from: 'user',
      text: userInput
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Parse the user's message using the backend
      const parsedResult = await parseEntry(userInput);
      
      // Generate a contextual response based on the parsed data
      let responseText = "I've analyzed your entry. ";
      
      if (parsedResult.amount) {
        responseText += `I see you mentioned spending $${parsedResult.amount}. `;
      }
      
      if (parsedResult.category) {
        responseText += `This appears to be a ${parsedResult.category.replace('_', ' ')} expense. `;
      }
      
      if (parsedResult.emotion && parsedResult.emotion !== 'neutral') {
        responseText += `I noticed you're feeling ${parsedResult.emotion} about this purchase. `;
      }
      
      if (parsedResult.needs_followup) {
        responseText += "Would you like to tell me more about what led to this decision?";
      } else {
        responseText += "Thanks for sharing this with me. I'm tracking your patterns to help you understand your spending better.";
      }

      const assistantResponse = {
        from: 'assistant',
        text: responseText
      };

      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      console.error('Failed to process message:', error);
      
      // Fallback response on error
      const errorResponse = {
        from: 'assistant',
        text: "I'm having trouble connecting to the backend service right now. Your message has been noted, but I can't provide detailed analysis at the moment. Please try again later."
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container className="py-4 voice-page">
      <div className="page-header mb-4">
        <h2 className="text-primary mb-2">Voice</h2>
        <p className="muted-text">Record voice memos to add context to your transactions.</p>
      </div>

      {/* Chat Area */}
      <div className="voice-chat-container">
        <div className="voice-messages">
          {messages.map((message, index) => (
            <VoiceBubble
              key={index}
              from={message.from}
              text={message.text}
            />
          ))}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="voice-input-area">
          <Form onSubmit={handleSend}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="voice-input"
              />
              <Button
                variant="outline-secondary"
                onClick={handleVoiceRecord}
                className="voice-mic-btn"
                type="button"
              >
                🎤
              </Button>
              <Button
                type="submit"
                className="btn-primary-custom voice-send-btn"
                disabled={!inputText.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  'Send'
                )}
              </Button>
            </InputGroup>
          </Form>
        </div>
      </div>
    </Container>
  );
}

export default VoicePage;
