import './VoiceBubble.css';

function VoiceBubble({ from = 'user', text }) {
  const isUser = from === 'user';

  return (
    <div className={`voice-bubble ${isUser ? 'voice-bubble-user' : 'voice-bubble-assistant'}`}>
      <div className="voice-bubble-content">
        <p className="voice-bubble-text">{text}</p>
      </div>
    </div>
  );
}

export default VoiceBubble;

