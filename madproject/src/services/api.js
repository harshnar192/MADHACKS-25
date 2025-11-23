// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Parse a voice entry transcript using the backend AI
 * @param {string} transcript - The voice transcript to parse
 * @returns {Promise<Object>} Parsed entry data including amount, category, emotion, etc.
 */
export async function parseEntry(transcript) {
  try {
    const response = await fetch(`${API_BASE_URL}/parse-entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to parse entry: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error parsing entry:', error);
    throw error;
  }
}

/**
 * Generate a summary using the backend AI
 * @param {string} persona - The persona type ('supportive_friend', 'stern_coach', 'neutral_advisor')
 * @param {Object} data - The data to generate summary from (goals, spending, entries, etc.)
 * @returns {Promise<Object>} Generated summary text
 */
export async function generateSummary(persona, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ persona, data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate summary: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

/**
 * Check if the backend API is available
 * @returns {Promise<boolean>} True if backend is healthy
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Transcribe audio blob to text using Fish Audio backend service
 * @param {Blob} audioBlob - The audio blob to transcribe
 * @param {string} duration - Recording duration
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeAudio(audioBlob, duration = '0') {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('duration', duration.toString());

    console.log('🎤 Sending audio to backend for transcription...');
    console.log('Audio size:', audioBlob.size, 'bytes');

    const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Transcription successful:', result.text);
    
    return result.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
