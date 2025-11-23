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
 * Match a parsed entry to bank transactions
 * @param {Object} parsedEntry - The parsed entry data
 * @param {string} transcript - The original transcript
 * @param {string} entryTime - ISO timestamp of the entry
 * @returns {Promise<Object>} Match result with confidence and matched transaction
 */
export async function matchTransaction(parsedEntry, transcript, entryTime = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/match-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        parsedEntry, 
        transcript, 
        entryTime: entryTime || new Date().toISOString() 
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to match transaction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error matching transaction:', error);
    throw error;
  }
}

/**
 * Get bank transactions from the backend
 * @returns {Promise<Object>} Bank transactions data
 */
export async function getBankTransactions() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bank transactions:', error);
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
 * Save an emotional transaction to the database
 * @param {Object} data - Transaction data
 * @returns {Promise<Object>} Saved transaction
 */
export async function saveEmotionalTransaction(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/emotional-transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to save emotional transaction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving emotional transaction:', error);
    throw error;
  }
}

/**
 * Get emotional transactions for a user
 * @param {string} userId - User ID
 * @param {number} limit - Max number of transactions
 * @returns {Promise<Object>} Transactions list
 */
export async function getEmotionalTransactions(userId = 'default', limit = 100) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/emotional-transactions?userId=${userId}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch emotional transactions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching emotional transactions:', error);
    throw error;
  }
}

/**
 * Get emotional spending breakdown for charts
 * @param {string} userId - User ID
 * @param {string} timeframe - 'day', 'week', 'month', 'all'
 * @returns {Promise<Object>} Breakdown data
 */
export async function getEmotionalSpendingBreakdown(userId = 'default', timeframe = 'month') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/emotional-spending/breakdown?userId=${userId}&timeframe=${timeframe}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch breakdown: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching emotional spending breakdown:', error);
    throw error;
  }
}

/**
 * Confirm or deny a transaction that needed correction
 * @param {string} transactionId - Transaction ID
 * @param {boolean} confirmed - User confirmed or denied
 * @param {string} correctedMerchant - Corrected merchant name if confirmed
 * @returns {Promise<Object>} Updated transaction
 */
export async function confirmTransaction(transactionId, confirmed, correctedMerchant = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/emotional-transactions/${transactionId}/confirm`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ confirmed, correctedMerchant }),
    });

    if (!response.ok) {
      throw new Error(`Failed to confirm transaction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error confirming transaction:', error);
    throw error;
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
