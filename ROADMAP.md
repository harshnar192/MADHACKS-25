# 🗺️ MadHacks Project Roadmap

## 📊 Current State Analysis

### ✅ What's Working
- **Backend API**: Fully functional with 5 endpoints (transcribe, parse-entry, match-transaction, generate-summary, health)
- **AI Integration**: Claude for parsing/summaries, Fish Audio for speech-to-text
- **Frontend Pages**: All core pages built (CheckIn, Voice, Insights, Summary, Goals, About)
- **State Management**: DataContext with localStorage persistence
- **Voice Recording**: End-to-end voice → transcription → parsing → storage working
- **Transaction Matching**: AI matching against bank transactions from JSON file

### ❌ What's Missing
- **Database**: All data stored in localStorage (client-side only, no persistence across devices)
- **Real Authentication**: Mock auth only, no actual user accounts
- **Backend Deployment**: Server only runs locally (not accessible externally)
- **Goals Management**: UI exists but no backend save/load functionality
- **Guardrails Feature**: UI modal exists but not connected to any backend logic
- **Weekly Analysis**: JSON file exists but no API endpoint to generate/retrieve it
- **User Profiles**: No multi-user support, all data is single-user
- **Invisible Spending Detection**: Data exists but not automated

---

## 🚀 Recommended Next Steps (Prioritized)

### **PHASE 1: Backend Foundation (START HERE)** ⭐
*Goal: Get your backend deployed and add database so data persists*

#### 1.1 Deploy Backend to Cloud (HIGHEST PRIORITY)
**Why**: Makes your app accessible from anywhere, required for testing on mobile

**Steps**:
```bash
# Option A: Railway (Recommended - easiest)
cd /Users/ayushichaudhary/Documents/MadHacks
brew install railway
railway login
railway init
railway up
# Add env vars in Railway dashboard: ANTHROPIC_API_KEY, FISH_API_KEY

# Option B: Render.com
# 1. Go to render.com → New → Web Service
# 2. Connect GitHub repo
# 3. Root Directory: /
# 4. Build: npm install
# 5. Start: node server.js
# 6. Add environment variables
```

**After deployment**:
- Update `madproject/.env` with production URL:
  ```
  VITE_API_URL=https://your-backend.railway.app
  ```
- Update CORS in `server.js` to allow production frontend URL

**Time**: 30 minutes  
**Difficulty**: Easy

---

#### 1.2 Add Database (PostgreSQL or MongoDB)
**Why**: localStorage disappears on browser clear, can't sync across devices, no multi-user support

**Recommendation**: Use PostgreSQL with Railway (free tier includes database)

**What to store**:
- Users (id, email, password_hash, name, created_at)
- CheckIns (id, user_id, amount, merchant, category, emotion, explanation, timestamp, transaction_id)
- Goals (id, user_id, type, category, target_amount, timeframe, description)
- Guardrails (id, user_id, trigger_phrase, spending_limit, category, notification_enabled)
- WeeklySummaries (id, user_id, week_start, week_end, total_spent, emotion_breakdown, summary_text)

**Implementation Plan**:

**Step 1**: Add database dependencies
```bash
cd /Users/ayushichaudhary/Documents/MadHacks
npm install pg  # for PostgreSQL
# OR
npm install mongodb  # for MongoDB
```

**Step 2**: Create database schema file
```sql
-- schema.sql (for PostgreSQL)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE check_ins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  merchant VARCHAR(255),
  category VARCHAR(100),
  emotion VARCHAR(50),
  explanation TEXT,
  transaction_id VARCHAR(100),
  match_confidence DECIMAL(5,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  target_amount DECIMAL(10,2) NOT NULL,
  timeframe VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guardrails (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  trigger_phrase TEXT,
  spending_limit DECIMAL(10,2),
  category VARCHAR(100),
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Step 3**: Create database connection module (`db.js`)

**Step 4**: Update server endpoints to use database instead of relying on frontend localStorage

**Time**: 2-3 hours  
**Difficulty**: Medium

---

#### 1.3 Add Real Authentication (JWT)
**Why**: Currently anyone can access all data, no user isolation

**Steps**:
1. Install dependencies:
   ```bash
   npm install bcrypt jsonwebtoken
   ```

2. Create auth endpoints in `server.js`:
   - `POST /auth/signup` - Create user account
   - `POST /auth/login` - Return JWT token
   - `POST /auth/logout` - Invalidate token
   - `GET /auth/me` - Get current user info

3. Add JWT middleware to protect endpoints:
   ```javascript
   // Require valid JWT for all /api/* endpoints
   app.use('/api', verifyToken);
   ```

4. Update frontend `AuthContext.jsx` to call real API

5. Store JWT in localStorage and include in API requests

**Time**: 2 hours  
**Difficulty**: Medium

---

### **PHASE 2: Complete Missing Features**

#### 2.1 Goals Management Backend
**What**: API endpoints to save/load user goals

**Endpoints to add**:
```javascript
GET /api/goals           // Get user's goals
POST /api/goals          // Create new goal
PUT /api/goals/:id       // Update goal
DELETE /api/goals/:id    // Delete goal
GET /api/goals/:id/progress  // Get current progress vs target
```

**Frontend updates**:
- Connect `GoalsPage.jsx` to backend APIs
- Remove `mockData.js` dependency
- Save goals to database instead of hardcoding

**Time**: 1-2 hours  
**Difficulty**: Easy (if database already set up)

---

#### 2.2 Guardrails Feature Implementation
**What**: Allow users to set spending limits with automatic warnings

**Backend endpoints needed**:
```javascript
GET /api/guardrails      // Get user's guardrails
POST /api/guardrails     // Create guardrail
DELETE /api/guardrails/:id  // Remove guardrail
POST /api/guardrails/check  // Check if spending triggers a guardrail
```

**Logic to implement**:
- When a check-in is added, automatically check against guardrails
- If guardrail triggered (e.g., "coffee spending > $25/week"), return warning
- Track guardrail violations over time

**Frontend updates**:
- Connect modal in `GoalsPage.jsx` to actually save guardrails
- Show real-time warnings on `CheckInPage.jsx` when guardrail triggered

**Time**: 2-3 hours  
**Difficulty**: Medium

---

#### 2.3 Weekly Analysis Endpoint
**What**: Generate weekly spending summary with AI insights

**Current state**: `files/weekly_analysis.json` exists as example, but not generated dynamically

**Endpoint to add**:
```javascript
POST /api/analysis/weekly
// Body: { userId, startDate, endDate }
// Returns: Weekly summary with emotion patterns, goal progress, invisible spending
```

**Logic**:
1. Query all check-ins for user in date range
2. Calculate spending by category, emotion breakdown
3. Compare against goals
4. Use Claude AI to generate personalized summary (3 personas)
5. Store summary in database for caching

**Frontend updates**:
- Add "Generate Weekly Report" button on `InsightsPage.jsx`
- Display generated summary on `SummaryPage.jsx`

**Time**: 2-3 hours  
**Difficulty**: Medium

---

#### 2.4 Invisible Spending Detection
**What**: Automatically detect bank transactions that weren't logged as check-ins

**Approach**:
1. User uploads/syncs bank transactions (CSV or Plaid API)
2. Backend compares bank transactions to logged check-ins
3. Identify unmatched transactions
4. Show "invisible spending" on Insights page with prompt to retroactively log

**Backend endpoints**:
```javascript
POST /api/transactions/upload  // Upload bank statement CSV
GET /api/transactions/unmatched  // Get transactions without check-ins
POST /api/transactions/match-retroactive  // Match old transaction to check-in
```

**Time**: 3-4 hours  
**Difficulty**: Medium-Hard

---

### **PHASE 3: Enhanced Features**

#### 3.1 Mobile Responsiveness Audit
- Test all pages on mobile viewport
- Fix any layout issues
- Ensure voice recording works on mobile browsers

**Time**: 1-2 hours  
**Difficulty**: Easy

---

#### 3.2 Push Notifications
**What**: Alert users when they're about to exceed a goal or trigger a guardrail

**Options**:
- Web Push API (browser notifications)
- Email notifications (using SendGrid/Mailgun)
- SMS notifications (using Twilio)

**Time**: 2-3 hours  
**Difficulty**: Medium

---

#### 3.3 Data Visualization Improvements
**What**: Better charts and graphs on Insights page

**Ideas**:
- Spending trend over time (line chart)
- Emotion breakdown by day of week (bar chart)
- Category spending comparison (stacked bar chart)
- Goal progress over multiple weeks (line chart)

**Already installed**: recharts library

**Time**: 2-3 hours  
**Difficulty**: Easy-Medium

---

#### 3.4 Export Data Feature
**What**: Allow users to download their data as CSV or JSON

**Endpoints**:
```javascript
GET /api/export/check-ins?format=csv  // Download all check-ins
GET /api/export/all?format=json       // Download complete user data
```

**Time**: 1 hour  
**Difficulty**: Easy

---

### **PHASE 4: Production Polish**

#### 4.1 Error Handling & Validation
- Add comprehensive input validation on all forms
- Better error messages to users
- Fallback UI for failed API calls
- Offline mode detection

**Time**: 2-3 hours  
**Difficulty**: Medium

---

#### 4.2 Loading States & Skeletons
- Add loading spinners for API calls
- Skeleton loaders for data-heavy pages
- Optimistic UI updates

**Time**: 1-2 hours  
**Difficulty**: Easy

---

#### 4.3 Testing
- Add backend tests (Jest)
- Add frontend tests (React Testing Library)
- E2E tests (Playwright/Cypress)

**Time**: 4-6 hours  
**Difficulty**: Medium-Hard

---

#### 4.4 Deploy Frontend to Vercel
```bash
cd madproject
npm install -g vercel
vercel login
vercel --prod
```

**Time**: 15 minutes  
**Difficulty**: Easy

---

#### 4.5 Security Hardening
- Add rate limiting to API endpoints
- Sanitize all user inputs (prevent XSS)
- Add CSRF protection
- Use HTTPS only
- Add security headers (helmet.js)

**Time**: 2-3 hours  
**Difficulty**: Medium

---

#### 4.6 Performance Optimization
- Add Redis caching for summaries
- Implement pagination for large datasets
- Lazy load components
- Code splitting
- Image optimization

**Time**: 2-4 hours  
**Difficulty**: Medium

---

## 🎯 My Recommendation: Start With This

### **Week 1: Get Production-Ready**
1. ✅ Deploy backend to Railway (30 min)
2. ✅ Add PostgreSQL database (3 hours)
3. ✅ Implement real authentication (2 hours)
4. ✅ Update frontend to use real auth (1 hour)
5. ✅ Test everything end-to-end (1 hour)

**Total**: ~7-8 hours of work

### **Week 2: Complete Core Features**
1. ✅ Goals management backend + frontend (2 hours)
2. ✅ Guardrails implementation (3 hours)
3. ✅ Weekly analysis endpoint (3 hours)

**Total**: ~8 hours of work

### **Week 3: Polish & Deploy**
1. ✅ Mobile responsiveness fixes (2 hours)
2. ✅ Error handling improvements (2 hours)
3. ✅ Deploy frontend to Vercel (30 min)
4. ✅ Final testing & bug fixes (2 hours)

**Total**: ~6-7 hours of work

---

## 📝 Quick Cleanup Checklist

Before you start Phase 1, clean up these files:

```bash
# Delete old test file
rm test.js

# Optional: Remove old docs build if not needed
rm -rf docs/

# Commit your .gitignore and cleaned repo
git add .gitignore
git commit -m "Add comprehensive .gitignore and clean up old files"
git push
```

---

## 🚨 Critical Path to Working Product

**Must have (blocking deployment)**:
1. Database setup ← **START HERE**
2. Real authentication
3. Backend deployment

**Should have (for demo)**:
4. Goals backend
5. Weekly analysis endpoint
6. Frontend deployment

**Nice to have (post-demo)**:
7. Guardrails feature
8. Invisible spending detection
9. Push notifications
10. Advanced data viz

---

## 📊 Estimated Timeline

- **Minimum Viable Product**: 2 weeks (16-20 hours)
- **Full Featured Product**: 4-5 weeks (35-45 hours)
- **Production Polish**: 6-7 weeks (50-60 hours total)

---

## 🛠️ Technology Decisions Needed

### Database Choice
- **PostgreSQL** (Recommended): Structured data, relations, free tier on Railway
- **MongoDB**: More flexible schema, good for rapid iteration

### Authentication
- **JWT + bcrypt** (Recommended): Simple, stateless, works well with your stack
- **Auth0/Clerk**: Managed service, faster setup but adds dependency

### File Storage (for bank statements)
- **AWS S3**: Industry standard
- **Cloudinary**: Easy setup
- **Railway volumes**: Simple but limited

### Deployment
- **Backend**: Railway.app (recommended) or Render.com
- **Frontend**: Vercel (recommended) or Netlify
- **Database**: Railway PostgreSQL (recommended) or Supabase

---

## 📞 Need Help With?

Based on your current setup, I recommend starting with **Phase 1.1 (Backend Deployment)**. 

Would you like me to:
1. **Guide you through Railway deployment step-by-step**
2. **Set up the database schema and connection code**
3. **Implement JWT authentication**
4. **Something else?**

Just let me know where you want to start!
