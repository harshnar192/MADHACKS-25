import { useState } from 'react';
import { Container, Form, Button, InputGroup } from 'react-bootstrap';
import VoiceBubble from '../components/VoiceBubble';
import { initialMessages } from '../mockData';
import './VoicePage.css';

function VoicePage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');

  // TODO: Implement voice recording functionality when backend is ready
  const handleVoiceRecord = () => {
    alert('Voice recording coming soon! This will integrate with speech-to-text API.');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const newUserMessage = {
      from: 'user',
      text: inputText.trim()
    };

    // TODO: Replace with real AI assistant response when backend is integrated
    // For now, add a placeholder assistant response
    const assistantResponse = {
      from: 'assistant',
      text: "I understand your question. This is a placeholder response. In the full version, this will use AI to analyze your spending patterns and provide personalized advice."
    };

    setMessages(prev => [...prev, newUserMessage, assistantResponse]);
    setInputText('');
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
                disabled={!inputText.trim()}
              >
                Send
              </Button>
            </InputGroup>
          </Form>
        </div>
      </div>
    </Container>
  );
}

export default VoicePage;
