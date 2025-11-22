// Mock data for the application
// TODO: Replace with real API calls when backend is integrated

export const emotionalSpending = 340;

export const emotionBreakdown = [
  { label: 'Tired', percentage: 27, color: 'warning' },
  { label: 'Stress', percentage: 50, color: 'danger' },
  { label: 'Deserved', percentage: 20, color: 'success' },
];

export const invisibleSpending = [
  { 
    label: 'Starbucks', 
    amount: '$45.20', 
    note: 'Late night caffeine runs',
    icon: '☕',
    amountType: 'negative'
  },
  { 
    label: 'Amazon', 
    amount: '$128.99', 
    note: 'Impulse purchases',
    icon: '📦',
    amountType: 'negative'
  },
  { 
    label: 'Snacks', 
    amount: '$23.50', 
    note: 'Convenience store visits',
    icon: '🍫',
    amountType: 'negative'
  },
];

export const recentCheckIns = [
  {
    label: 'Uber Eats',
    amount: '$47',
    note: 'Tired after work',
    icon: '🍔',
    amountType: 'negative'
  },
  {
    label: 'Nike',
    amount: '$200',
    note: 'Stressed before interview',
    icon: '👟',
    amountType: 'negative'
  }
];

// Summary Page Data
export const spendingByCategory = [
  { category: 'Food', amount: 450, total: 1200, percentage: 37.5 },
  { category: 'Shopping', amount: 380, total: 1200, percentage: 31.7 },
  { category: 'Entertainment', amount: 370, total: 1200, percentage: 30.8 },
];

export const totalSpent = 1200;

export const emotionalTriggers = [
  { trigger: 'Tired', count: 8 },
  { trigger: 'Stress', count: 12 },
  { trigger: 'Deserved', count: 5 },
];

export const weeklyInsight = "Fridays after 6PM → highest risk of emotional spending.";

export const coachingText = `This week, you spent $340 on emotional purchases, which is 28% of your total spending. Your primary triggers were stress (12 occurrences) and fatigue (8 occurrences). Most of these purchases happened late in the evening after work. Consider setting up a daily 5PM reminder to pause before making purchases.`;

// Voice Page Data
export const initialMessages = [
  {
    from: 'user',
    text: 'Can I afford a weekend trip to Chicago?'
  },
  {
    from: 'assistant',
    text: `Based on your current spending patterns, you have $180 remaining this month after accounting for your regular expenses. A weekend trip to Chicago would likely cost around $300-400 including travel, accommodation, and food. 

However, I noticed you've had 8 "tired" check-ins and 12 "stress" check-ins this month, which often lead to unplanned spending. If you make this trip, I'd recommend: 1) Set a strict budget before you go, 2) Avoid late-night purchases, and 3) Consider it a reward for hitting your savings goal next month instead.

Would you like me to help you plan a more budget-friendly alternative or adjust your monthly goals?`
  }
];

// Goals Page Data
export const monthlyGoal = {
  label: 'Save $500/month',
  current: 180,
  target: 500,
};

export const emotionalBlockers = [
  { phrase: 'I deserved it', count: 3 },
  { phrase: 'Too tired to cook', count: 5 },
  { phrase: 'Just this once', count: 2 },
];

export const blockerNote = "These patterns currently block your savings goal.";

