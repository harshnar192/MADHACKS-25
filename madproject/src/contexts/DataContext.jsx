import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getImpulsivePurchases } from '../services/api';

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
function getIconForMerchant(merchant, category = '') {
  const lower = (merchant || '').toLowerCase();
  const catLower = (category || '').toLowerCase();
  
  if (lower.includes('starbucks') || lower.includes('coffee') || lower.includes('cafe') || lower.includes("peet's") || catLower === 'coffee') return '☕';
  if (lower.includes('amazon') || lower.includes('online') || catLower === 'shopping') return '📦';
  if (lower.includes('uber') || lower.includes('lyft') || lower.includes('doordash') || lower.includes('postmates') || lower.includes('food') || lower.includes('eats') || catLower === 'food_delivery') return '🍔';
  if (lower.includes('nike') || lower.includes('shoe') || lower.includes('clothing')) return '👟';
  if (lower.includes('snack') || lower.includes('convenience') || lower.includes('vending') || lower.includes('walgreens') || lower.includes('7-eleven') || lower.includes('dunkin') || catLower === 'snacks') return '🍫';
  if (catLower === 'alcohol' || lower.includes('bar') || lower.includes('lounge') || lower.includes('liquor')) return '🍷';
  if (catLower === 'groceries' || lower.includes('whole foods') || lower.includes('target')) return '🛒';
  if (catLower === 'dining_out' || lower.includes('mcdonald') || lower.includes('taco bell') || lower.includes('panera')) return '🍽️';
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

  // Fetch impulsive purchases from API
  const [impulsivePurchases, setImpulsivePurchases] = useState([]);
  const [loadingImpulsive, setLoadingImpulsive] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchImpulsiveData() {
      try {
        setLoadingImpulsive(true);
        setFetchError(null);
        const data = await getImpulsivePurchases();
        if (isMounted) {
          setImpulsivePurchases(data.transactions || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch impulsive purchases:', error);
          setImpulsivePurchases([]);
          setFetchError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoadingImpulsive(false);
        }
      }
    }
    
    fetchImpulsiveData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Save to localStorage whenever checkIns change
  useEffect(() => {
    localStorage.setItem('madHacks_checkIns', JSON.stringify(checkIns));
  }, [checkIns]);

  // Calculate mood breakdown from impulsive purchases - based on FREQUENCY (count)
  const moodBreakdown = useMemo(() => {
    if (impulsivePurchases.length === 0) {
      return [];
    }

    const moodCounts = {};
    const moodAmounts = {};
    
    // Process ALL transactions from impulsive.json
    impulsivePurchases.forEach(tx => {
      const mood = tx.mood || 'neutral';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      moodAmounts[mood] = (moodAmounts[mood] || 0) + (tx.amount || 0);
    });

    const totalCount = impulsivePurchases.length;

    // Calculate percentage based on FREQUENCY (count), not amount
    const breakdown = Object.keys(moodCounts).map(mood => ({
      mood: mood,
      percentage: Math.round((moodCounts[mood] / totalCount) * 100), // Based on count/frequency
      count: moodCounts[mood],
      amount: moodAmounts[mood]
    })).sort((a, b) => b.count - a.count); // Sort by count, not amount
    
    return breakdown;
  }, [impulsivePurchases]);

  // Calculate emotional spending breakdown (legacy - from checkIns)
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

  // Calculate total emotional spending (from impulsive purchases)
  const emotionalSpending = useMemo(() => {
    if (impulsivePurchases.length > 0) {
      return impulsivePurchases.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    }
    return checkIns.reduce((sum, checkIn) => sum + (checkIn.amountValue || 0), 0);
  }, [impulsivePurchases, checkIns]);

  // Calculate spending by mood (for bar chart)
  const spendingByMood = useMemo(() => {
    if (impulsivePurchases.length === 0) {
      return [];
    }

    const moodAmounts = {};
    const moodCounts = {};
    
    impulsivePurchases.forEach(tx => {
      const mood = tx.mood || 'neutral';
      moodAmounts[mood] = (moodAmounts[mood] || 0) + (tx.amount || 0);
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    return Object.keys(moodAmounts).map(mood => ({
      mood: mood,
      amount: moodAmounts[mood],
      count: moodCounts[mood]
    })).sort((a, b) => b.amount - a.amount);
  }, [impulsivePurchases]);

  // Calculate spending by category and mood
  const spendingByCategoryMood = useMemo(() => {
    if (impulsivePurchases.length === 0) {
      return [];
    }

    const categoryMoodMap = {};
    
    impulsivePurchases.forEach(tx => {
      const category = tx.category || 'other';
      const mood = tx.mood || 'neutral';
      const key = `${category}_${mood}`;
      
      if (!categoryMoodMap[key]) {
        categoryMoodMap[key] = {
          category,
          mood,
          amount: 0,
          count: 0
        };
      }
      
      categoryMoodMap[key].amount += tx.amount || 0;
      categoryMoodMap[key].count += 1;
    });

    return Object.values(categoryMoodMap).sort((a, b) => b.amount - a.amount);
  }, [impulsivePurchases]);

  // Calculate invisible spending (small purchases) from impulsive purchases
  const invisibleSpending = useMemo(() => {
    if (impulsivePurchases.length > 0) {
      return impulsivePurchases
        .filter(tx => (tx.amount || 0) < 50)
        .slice(0, 3)
        .map(tx => ({
          label: tx.merchant,
          amount: `$${(tx.amount || 0).toFixed(2)}`,
          note: `${tx.category.replace('_', ' ')} • ${tx.mood}`,
          icon: getIconForMerchant(tx.merchant, tx.category),
          amountType: 'negative'
        }));
    }
    // Fallback to checkIns if no impulsive data
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
  }, [impulsivePurchases, checkIns]);

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

  // Calculate spending by category from impulsive purchases
  const spendingByCategory = useMemo(() => {
    if (impulsivePurchases.length > 0) {
      const categories = {};
      impulsivePurchases.forEach(tx => {
        const category = tx.category || 'other';
        categories[category] = (categories[category] || 0) + (tx.amount || 0);
      });

      const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
      return Object.entries(categories).map(([category, amount]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '), // Format: "Shopping", "Food Delivery"
        amount,
        total,
        percentage: total > 0 ? Math.round((amount / total) * 100 * 10) / 10 : 0
      })).sort((a, b) => b.amount - a.amount);
    }
    
    // Fallback to checkIns if no impulsive data
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
  }, [impulsivePurchases, checkIns]);

  // Calculate emotional triggers count from impulsive purchases
  const emotionalTriggers = useMemo(() => {
    if (impulsivePurchases.length > 0) {
      const triggers = {};
      impulsivePurchases.forEach(tx => {
        const mood = tx.mood || 'neutral';
        const triggerName = mood.charAt(0).toUpperCase() + mood.slice(1).replace('_', ' '); // Format: "Anxious", "Peer Pressure"
        triggers[triggerName] = (triggers[triggerName] || 0) + 1;
      });

      return Object.entries(triggers)
        .map(([trigger, count]) => ({ trigger, count }))
        .sort((a, b) => b.count - a.count);
    }
    
    // Fallback to checkIns
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
  }, [impulsivePurchases, checkIns]);

  // Calculate weekly summary stats from impulsive purchases
  const weeklySummary = useMemo(() => {
    if (impulsivePurchases.length === 0) {
      return {
        lateEveningPercentage: 0,
        topMoodTrigger: null,
        topMoodPercentage: 0
      };
    }

    // Calculate late evening purchases (8pm - 6am)
    const lateEvening = impulsivePurchases.filter(tx => {
      const hour = parseInt(tx.time?.split(':')[0] || '12');
      return hour >= 20 || hour <= 6;
    });
    const lateEveningPercentage = Math.round((lateEvening.length / impulsivePurchases.length) * 100);

    // Get top mood trigger
    const topMood = moodBreakdown.length > 0 ? moodBreakdown[0] : null;

    return {
      lateEveningPercentage,
      topMoodTrigger: topMood?.mood || null,
      topMoodPercentage: topMood?.percentage || 0
    };
  }, [impulsivePurchases, moodBreakdown]);

  const value = {
    checkIns,
    addCheckIn,
    recentCheckIns,
    emotionBreakdown,
    emotionalSpending,
    invisibleSpending,
    spendingByCategory,
    emotionalTriggers,
    totalSpent: emotionalSpending,
    // New mood-based data
    impulsivePurchases,
    loadingImpulsive,
    moodBreakdown,
    spendingByMood,
    spendingByCategoryMood,
    weeklySummary
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

