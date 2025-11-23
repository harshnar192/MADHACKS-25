# MadHacks - Emotional Spending Tracker

A full-stack application that helps users understand their emotional spending patterns through AI-powered analysis.

## Architecture

This project consists of two main parts:
- **Backend** (root directory): Node.js/Express server with AI integration
- **Frontend** (madproject/): React application with Vite

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Anthropic API key (for AI features)

## Setup Instructions

### 1. Backend Setup

```bash
# Install backend dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your Anthropic API key
# ANTHROPIC_API_KEY=your_actual_api_key_here

# Start the backend server
npm start
```

The backend server will run on `http://localhost:3001`

Available endpoints:
- `GET /health` - Health check
- `POST /parse-entry` - Parse voice transcript
- `POST /generate-summary` - Generate AI coaching summary

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd madproject

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
```

### Frontend (madproject/.env)
```
VITE_API_URL=http://localhost:3001
```

## Features

### Connected Features
✅ **Check-In Page**: Records spending with emotional context and parses with AI
✅ **Voice Page**: Chat interface with AI parsing of spending entries  
✅ **Summary Page**: Generate personalized coaching summaries with different personas

### Current Limitations
- Voice transcription not yet implemented (use text input for now)
- No persistent database (data resets on page refresh)
- Bank transaction matching is implemented but not integrated into UI

## Project Structure

```
/
├── server.js                 # Express backend server
├── parseVoiceEntry.js       # AI-powered transcript parser
├── generateSummary.js       # AI-powered summary generator
├── matchTransaction.js      # Transaction matching logic
├── package.json             # Backend dependencies
└── madproject/              # React frontend
    ├── src/
    │   ├── pages/           # Page components
    │   ├── components/      # Reusable components
    │   ├── services/        # API service layer
    │   ├── hooks/           # Custom React hooks
    │   └── contexts/        # React contexts
    └── package.json         # Frontend dependencies
```

## Development Workflow

1. Start the backend server:
   ```bash
   npm start
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd madproject
   npm run dev
   ```

3. Access the app at `http://localhost:5173`

## API Usage Examples

### Parse Entry
```bash
curl -X POST http://localhost:3001/parse-entry \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Spent 50 bucks on drinks, feeling stressed"}'
```

### Generate Summary
```bash
curl -X POST http://localhost:3001/generate-summary \
  -H "Content-Type: application/json" \
  -d '{
    "persona": "supportive_friend",
    "data": {
      "goals": [...],
      "spending": {...},
      "voiceEntries": [...]
    }
  }'
```

## Troubleshooting

### Backend won't start
- Check that your Anthropic API key is set in `.env`
- Ensure port 3001 is not already in use

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check CORS settings in `server.js`
- Ensure `VITE_API_URL` is set correctly in `madproject/.env`

### AI features not working
- Verify your Anthropic API key is valid
- Check backend logs for error messages
- Ensure you have internet connectivity

## Contributing

This project was created for MadHacks 2025.

## License

ISC
