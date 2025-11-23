# Mock Data for Voice Money Journal

## Files Overview

| File | Purpose |
|------|---------|
| `bank_transactions.json` | Simulated bank data (22 transactions over 1 week) |
| `goals.json` | User's financial goals |
| `voice_entries.json` | What the user actually logged via voice (8 entries) |
| `weekly_analysis.json` | Pre-computed insights for demo |

---

## The Story This Data Tells

**User Profile:** Alex Chen, young professional, trying to get finances under control.

### The Patterns (for demo impact)

1. **Stress → Food Delivery**
   - 3 times this week: felt stressed/tired → ordered delivery within 2 hours
   - $140 total on delivery (goal was $75)

2. **Peer Pressure → Bar Spending**  
   - "Couldn't say no to coworkers"
   - 3 bar nights totaling $225 (goal was $100)
   - User explicitly said "this is becoming a problem"

3. **Invisible Spending (THE BIG INSIGHT)**
   - 22 total transactions
   - Only 8 were logged via voice
   - 14 transactions ($287) completely untracked
   - Mostly small stuff: coffee, snacks, convenience stores
   - This is your demo "aha moment"

4. **Good Behavior Too**
   - Coffee actually under budget ($22.50 of $25 goal)
   - Groceries with positive emotion ("gonna meal prep")
   - Self-awareness increasing ("this is becoming a problem")

---

## How to Use in Demo

### Flow 1: Show the Problem
1. Display bank transactions
2. Show which ones have voice entries (8 of 22)
3. Reveal: "14 purchases, $287, completely invisible to you"

### Flow 2: Show Emotional Patterns
1. Play a voice entry: "DoorDash again... super stressful day"
2. Show the pattern: stress → delivery → guilt
3. Insight: "This happened 3 times this week"

### Flow 3: Weekly Summary (The Wow Moment)
1. User picks persona (stern coach for drama)
2. Play TTS summary that ties it all together
3. "Three bar nights, three regret entries. You see the pattern."

---

## Categories Used

- `food_delivery` - Uber Eats, DoorDash, Grubhub
- `coffee` - Starbucks, coffee shops
- `alcohol` - Bars, happy hours
- `dining_out` - Restaurants (not delivery)
- `groceries` - Whole Foods, grocery stores
- `shopping` - Target, Amazon
- `snacks` - Vending machines, convenience stores
- `transport` - Uber, Lyft
- `subscriptions` - Netflix, Spotify
- `bills` - Utilities

---

## Emotions Used

- `guilt` - Feels bad about purchase
- `stressed` - Purchase driven by stress
- `regret` - Wishes they hadn't bought it
- `impulsive` - Unplanned purchase
- `positive` - Good feeling about purchase
- `justified` - Rationalizing the purchase
- `self-critical` - Disappointed in self
- `anxious` - Worried about pattern

---

## Quick Stats for Reference

| Metric | Value |
|--------|-------|
| Total transactions | 22 |
| Total spent | $976.24 |
| Logged entries | 8 (36%) |
| Unlogged transactions | 14 (64%) |
| Unlogged amount | $286.96 |
| Food delivery goal | $75 |
| Food delivery actual | $140.53 (187%) |
| Alcohol goal | $100 |
| Alcohol actual | $225.00 (225%) |
| Coffee goal | $25 |
| Coffee actual | $22.50 (90%) ✓ |
