// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Token management
const TOKEN_KEY = 'madhacks_auth_token';
const USER_KEY = 'madhacks_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

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
 * Get impulsive purchases with mood data from the backend
 * @returns {Promise<Object>} Impulsive purchases data with moods
 */
export async function getImpulsivePurchases() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/impulsive`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch impulsive purchases: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching impulsive purchases:', error);
    throw error;
  }
}

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store token and user
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
    }

    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/**
 * Sign up new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @returns {Promise<Object>} User data and token
 */
export async function signupUser(email, password, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    
    // Store token and user
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setUser(data.user);
    }

    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

/**
 * Verify JWT token and get user data
 * @returns {Promise<Object>} User data
 */
export async function verifyToken() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Token is invalid, clear storage
      removeToken();
      throw new Error('Invalid or expired token');
    }

    const data = await response.json();
    
    // Update stored user data
    if (data.user) {
      setUser(data.user);
    }

    return data;
  } catch (error) {
    console.error('Error verifying token:', error);
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

    const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
