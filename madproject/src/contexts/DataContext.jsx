import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const DataContext = createContext();

// Helper function to extract emotion from explanation text
function extractEmotion(explanation) {
  const lowerText = explanation.toLowerCase();
  if (lowerText.includes('stress') || lowerText.includes('stressed') || lowerText.includes('anxious') || lowerText.includes('worried')) {
    return 'Stress';
  }
  if (lowerText.includes('tired') || lowerText.includes('exhausted') || lowerText.includes('fatigue') || lowerText.includes('sleepy')) {
    return 'Tired';
  }
  if (lowerText.includes('deserve') || lowerText.includes('reward') || lowerText.includes('treat') || lowerText.includes('earned')) {
    return 'Deserved';
  }
  // Default to Stress if no match
  return 'Stress';
}

// Helper function to get icon based on merchant/category
function getIconForMerchant(merchant) {
  const lower = merchant.toLowerCase();
  if (lower.includes('starbucks') || lower.includes('coffee') || lower.includes('cafe')) return '☕';
  if (lower.includes('amazon') || lower.includes('online')) return '📦';
  if (lower.includes('uber') || lower.includes('lyft') || lower.includes('food') || lower.includes('eats')) return '🍔';
  if (lower.includes('nike') || lower.includes('shoe') || lower.includes('clothing')) return '👟';
  if (lower.includes('snack') || lower.includes('convenience')) return '🍫';
  return '💰';
}

export function DataProvider({ children }) {
  // Initialize with mock data
  const [checkIns, setCheckIns] = useState(() => {
    const saved = localStorage.getItem('madHacks_checkIns');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default mock data
    return [
      {
        id: Date.now() - 2,
        label: 'Uber Eats',
        amount: '$47',
        note: 'Tired after work',
        icon: '🍔',
        amountType: 'negative',
        emotion: 'Tired',
        amountValue: 47
      },
      {
        id: Date.now() - 1,
        label: 'Nike',
        amount: '$200',
        note: 'Stressed before interview',
        icon: '👟',
        amountType: 'negative',
        emotion: 'Stress',
        amountValue: 200
      }
    ];
  });

  // Save to localStorage whenever checkIns change
  useEffect(() => {
    localStorage.setItem('madHacks_checkIns', JSON.stringify(checkIns));
  }, [checkIns]);

  // Calculate emotional spending breakdown
  const emotionBreakdown = useMemo(() => {
    const emotionCounts = {};
    const emotionAmounts = {};
    
    checkIns.forEach(checkIn => {
      const emotion = checkIn.emotion || extractEmotion(checkIn.note || '');
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      emotionAmounts[emotion] = (emotionAmounts[emotion] || 0) + (checkIn.amountValue || 0);
    });

    const totalAmount = Object.values(emotionAmounts).reduce((sum, val) => sum + val, 0);
    const totalCount = checkIns.length;

    if (totalCount === 0) {
      return [
        { label: 'Tired', percentage: 0, color: 'warning', count: 0, amount: 0 },
        { label: 'Stress', percentage: 0, color: 'danger', count: 0, amount: 0 },
        { label: 'Deserved', percentage: 0, color: 'success', count: 0, amount: 0 },
      ];
    }

    return [
      {
        label: 'Tired',
        percentage: Math.round((emotionCounts['Tired'] || 0) / totalCount * 100),
        color: 'warning',
        count: emotionCounts['Tired'] || 0,
        amount: emotionAmounts['Tired'] || 0
      },
      {
        label: 'Stress',
        percentage: Math.round((emotionCounts['Stress'] || 0) / totalCount * 100),
        color: 'danger',
        count: emotionCounts['Stress'] || 0,
        amount: emotionAmounts['Stress'] || 0
      },
      {
        label: 'Deserved',
        percentage: Math.round((emotionCounts['Deserved'] || 0) / totalCount * 100),
        color: 'success',
        count: emotionCounts['Deserved'] || 0,
        amount: emotionAmounts['Deserved'] || 0
      },
    ];
  }, [checkIns]);

  // Calculate total emotional spending
  const emotionalSpending = useMemo(() => {
    return checkIns.reduce((sum, checkIn) => sum + (checkIn.amountValue || 0), 0);
  }, [checkIns]);

  // Calculate invisible spending (small purchases)
  const invisibleSpending = useMemo(() => {
    return checkIns
      .filter(checkIn => (checkIn.amountValue || 0) < 50)
      .slice(0, 3)
      .map(checkIn => ({
        label: checkIn.label,
        amount: checkIn.amount,
        note: checkIn.note,
        icon: checkIn.icon,
        amountType: 'negative'
      }));
  }, [checkIns]);

  // Add new check-in
  const addCheckIn = (data) => {
    const amountValue = parseFloat(data.amount.replace(/[^0-9.]/g, '')) || 0;
    const emotion = extractEmotion(data.explanation || '');
    const icon = getIconForMerchant(data.merchant || '');
    
    const newCheckIn = {
      id: Date.now(),
      label: data.merchant || 'Unknown',
      amount: data.amount.startsWith('$') ? data.amount : `$${data.amount}`,
      note: data.explanation || '',
      icon: icon,
      amountType: 'negative',
      emotion: emotion,
      amountValue: amountValue
    };

    setCheckIns(prev => [newCheckIn, ...prev]);
    return newCheckIn;
  };

  // Get recent check-ins
  const recentCheckIns = useMemo(() => {
    return checkIns.slice(0, 10).map(checkIn => ({
      label: checkIn.label,
      amount: checkIn.amount,
      note: checkIn.note,
      icon: checkIn.icon,
      amountType: checkIn.amountType
    }));
  }, [checkIns]);

  // Calculate spending by category
  const spendingByCategory = useMemo(() => {
    const categories = {};
    checkIns.forEach(checkIn => {
      const category = checkIn.label || 'Other';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += checkIn.amountValue || 0;
    });

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      total,
      percentage: total > 0 ? Math.round((amount / total) * 100 * 10) / 10 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [checkIns]);

  // Calculate emotional triggers count
  const emotionalTriggers = useMemo(() => {
    const triggers = {};
    checkIns.forEach(checkIn => {
      const emotion = checkIn.emotion || extractEmotion(checkIn.note || '');
      triggers[emotion] = (triggers[emotion] || 0) + 1;
    });

    return [
      { trigger: 'Tired', count: triggers['Tired'] || 0 },
      { trigger: 'Stress', count: triggers['Stress'] || 0 },
      { trigger: 'Deserved', count: triggers['Deserved'] || 0 },
    ];
  }, [checkIns]);

  const value = {
    checkIns,
    addCheckIn,
    recentCheckIns,
    emotionBreakdown,
    emotionalSpending,
    invisibleSpending,
    spendingByCategory,
    emotionalTriggers,
    totalSpent: emotionalSpending
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

