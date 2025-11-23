/**
 * Converts audio blob to speech-to-text using server proxy
 * The server handles the Fish Audio API call to keep API key secure
 * @param {Blob} audioBlob - The recorded audio blob
 * @returns {Promise<string>} - The transcribed text
 */
export async function transcribeAudio(audioBlob) {
  const API_URL = 'http://localhost:3001/api/transcribe';

  try {
    console.log('📤 Sending audio to server:', {
      size: audioBlob.size,
      type: audioBlob.type
    });

    // Create FormData to send the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Server response:', {
      status: response.status,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      console.error('❌ Server error:', errorData);
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Transcription received:', data);
    return data.text || '';
  } catch (error) {
    console.error('❌ Transcription error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Make sure the server is running on port 3001.');
    }
    throw error;
  }
}

