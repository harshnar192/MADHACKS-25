# Smart Transaction Matching System

## Overview

The system uses AI-powered fuzzy matching to intelligently match user voice entries to actual bank transactions. It handles common scenarios like approximate amounts, merchant name variations, and even calls out users when they claim spending that didn't happen.

## How It Works

### Input
- **User voice/text entry**: "Spent $75 at Target"
- **Parsed data**: Amount, merchant, category extracted by AI
- **Bank transactions**: Actual transactions from bank statement

### Output
The system returns one of three responses:

1. **✅ Clean Match** - Transaction matched with high confidence
2. **🤔 Needs Correction** - Found a match but merchant name is wrong (asks for confirmation)
3. **🤨 Skeptical** - No matching transaction found (calls out the user)

## Matching Rules

### 1. Amount Tolerance (±20%)
```javascript
User says: "$75"
Bank shows: "$70.04"
Result: ✅ ACCEPT (within 20% range)

User says: "$50"  
Bank shows: "$5.00"
Result: ❌ REJECT (too far off)
```

### 2. Merchant Name Fuzzy Matching
```javascript
// Needs Correction
User says: "Target"
Bank shows: "Whole Foods"
Response: "🤔 Did you mean Whole Foods instead of Target?"

// Accept Different Formats
User says: "Starbucks"
Bank shows: "STARBUCKS #1234"
Result: ✅ ACCEPT (same merchant, bank format)

// Accept Category Match
User says: "coffee shop"
Bank shows: "Blue Bottle Coffee"
Result: ✅ ACCEPT (category match)
```

### 3. Time Proximity
Prefers transactions from:
- Same day as voice entry
- Previous 24 hours
- Within reasonable time window

### 4. No Match Found
```javascript
User says: "Bought Nike shoes for $200"
Bank shows: No matching transaction
Response: "🤨 Wait, you didn't spend that. There's no transaction matching what you said."
```

## Example Scenarios

### Scenario 1: Approximate Amount ✅
```
Voice: "Just spent like 50 bucks at Uber Eats"
Bank: $47.23 at Uber Eats on 2025-02-01
Result: ✅ Matched (within tolerance)
```

### Scenario 2: Wrong Merchant Name 🤔
```
Voice: "Spent $75 at Target for groceries"
Bank: $70.04 at Whole Foods on 2025-02-01
Result: 🤔 "Did you mean Whole Foods instead of Target?"
```

### Scenario 3: Fabricated Spending 🤨
```
Voice: "Bought new shoes at Nike for $200"
Bank: No Nike transactions, no $200 transactions
Result: 🤨 "Wait, you didn't spend that. There's no transaction matching what you said."
```

### Scenario 4: Bank Format Variations ✅
```
Voice: "Got Starbucks this morning, $5"
Bank: $5.75 at "STARBUCKS #1234" on 2025-02-01 08:12:00
Result: ✅ Matched (recognized bank format)
```

## API Response Format

```json
{
  "matched": true,
  "transaction_id": "TXN20250201156",
  "confidence": 85,
  "needs_correction": false,
  "correction_prompt": null,
  "skeptical_message": null,
  "reason": "Amount within acceptable range, same merchant, same day",
  "transaction": {
    "transaction_id": "TXN20250201156",
    "amount": 70.04,
    "merchant": "Whole Foods",
    "category": "groceries",
    "date": "2025-02-01",
    "datetime": "2025-02-01T06:59:00"
  }
}
```

### Fields Explained

- `matched` (boolean): Did we find a transaction?
- `transaction_id` (string): The matched transaction ID
- `confidence` (0-100): How confident is the match?
- `needs_correction` (boolean): Is the merchant name wrong?
- `correction_prompt` (string): Question to ask user (e.g., "Did you mean X?")
- `skeptical_message` (string): Message when no match found
- `reason` (string): Explanation of the match/mismatch
- `transaction` (object): Full matched transaction details

## Frontend Display

### Clean Match (Green Alert)
```
✅ Transaction Matched!
Matched to: Whole Foods - $70.04
Confidence: 85% - Amount within acceptable range
```

### Needs Correction (Blue Alert)
```
🤔 Wait, did you mean...
Did you mean Whole Foods instead of Target?
Confidence: 75% - Similar amount and category match
```

### Skeptical (Yellow/Warning Alert)
```
🤨 Hold up...
Wait, you didn't spend that. There's no transaction matching what you said.
No transactions found with similar amount or merchant
```

## Testing

### Test the Matching
1. Start backend: `node server.js`
2. Go to Check-In page
3. Try these test cases:

**Test 1: Exact Match**
Say: "Spent $47 at Uber Eats"
Expected: ✅ Clean match

**Test 2: Wrong Merchant**
Say: "Spent $70 at Target" (but bank shows Whole Foods)
Expected: 🤔 Correction prompt

**Test 3: Fake Spending**
Say: "Bought a laptop for $1500 at Best Buy"
Expected: 🤨 Skeptical message

**Test 4: Approximate Amount**
Say: "Got coffee for like 6 bucks" (bank shows $5.75)
Expected: ✅ Clean match

## Bank Transaction Format

Your bank data should have this structure:
```json
{
  "transaction_id": "TXN20250201156",
  "amount": 70.04,
  "merchant": "Whole Foods",
  "category": "groceries",
  "date": "2025-02-01",
  "time": "06:59:00",
  "datetime": "2025-02-01T06:59:00",
  "day_of_week": "Saturday",
  "description": "WHOLE FOODS",
  "location": { "city": "San Francisco", "state": "CA" },
  "payment_method": "Debit Card",
  "status": "Completed"
}
```

Required fields: `transaction_id`, `amount`, `merchant`, `date` or `datetime`

## Files Modified

- `matchTransaction.js` - New fuzzy matching logic with correction prompts
- `server.js` - Already set up correctly, no changes needed
- `CheckInPage.jsx` - Updated to display correction prompts and skeptical messages
- `SMART_MATCHING.md` - This documentation

## Production Readiness

✅ Works with real bank data (reads from `files/bank_transactions.json`)  
✅ Handles approximate amounts intelligently  
✅ Prompts user for corrections when needed  
✅ Calls out fake spending  
✅ No auto-generation - uses actual bank data only  

Ready for real bank integration (Plaid, Yodlee, etc.)
