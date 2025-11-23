import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getEmotionalTransactions, getBankTransactions } from '../services/api';

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
  // Fetch from MongoDB instead of localStorage
  const [checkIns, setCheckIns] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch emotional transactions and bank transactions on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        console.log('🔄 Loading emotional transactions and bank data...');
        
        // Fetch both emotional transactions and bank transactions in parallel
        const [emotionalResponse, bankResponse] = await Promise.all([
          getEmotionalTransactions('default', 100),
          getBankTransactions()
        ]);
        
        console.log('✅ Received emotional transactions:', emotionalResponse);
        console.log('✅ Received bank transactions:', bankResponse);
        
        if (!emotionalResponse || !emotionalResponse.transactions) {
          console.warn('⚠️ No emotional transactions in response:', emotionalResponse);
        }
        
        if (!bankResponse || !bankResponse.transactions) {
          console.warn('⚠️ No bank transactions in response:', bankResponse);
        }
        
        // Transform MongoDB documents to the format expected by UI
        const transformedData = (emotionalResponse.transactions || []).map(tx => ({
          id: tx._id,
          label: tx.merchant || 'Unknown',
          category: tx.category || 'other',
          amount: `$${Number(tx.amount || 0).toFixed(2)}`,
          note: tx.context || tx.transcript || '',
          icon: getIconForMerchant(tx.merchant || '', tx.category || ''),
          amountType: 'negative',
          emotion: tx.emotion ? (tx.emotion.charAt(0).toUpperCase() + tx.emotion.slice(1)) : 'Stress',
          amountValue: Number(tx.amount || 0),
          timestamp: tx.entry_time
        }));

        console.log(`✅ Transformed ${transformedData.length} emotional transactions`);
        console.log('Sample transformed data:', transformedData.slice(0, 2));
        setCheckIns(transformedData);
        
        // Store bank transactions
        const bankTxns = bankResponse.transactions || [];
        setBankTransactions(bankTxns);
        console.log(`✅ Loaded ${bankTxns.length} bank transactions`);
        
        setError(null);
        console.log('✅ Data loading complete!');
      } catch (err) {
        console.error('❌ Failed to load data:', err);
        console.error('Error stack:', err.stack);
        setError(err.message);
        setCheckIns([]);
        setBankTransactions([]);
      } finally {
        setIsLoading(false);
        console.log('🔚 Loading state set to false');
      }
    }

    loadData();
  }, []); // Load once on mount

  // Calculate mood breakdown from check-ins - based on FREQUENCY (count)
  const moodBreakdown = useMemo(() => {
    if (checkIns.length === 0) {
      return [];
    }

    const moodCounts = {};
    const moodAmounts = {};
    
    // Process ALL transactions from checkIns
    checkIns.forEach(tx => {
      const mood = (tx.emotion || 'neutral').toLowerCase();
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      moodAmounts[mood] = (moodAmounts[mood] || 0) + (tx.amountValue || 0);
    });

    const totalCount = checkIns.length;

    // Calculate percentage based on FREQUENCY (count), not amount
    const breakdown = Object.keys(moodCounts).map(mood => ({
      mood: mood,
      percentage: Math.round((moodCounts[mood] / totalCount) * 100), // Based on count/frequency
      count: moodCounts[mood],
      amount: moodAmounts[mood]
    })).sort((a, b) => b.count - a.count); // Sort by count, not amount
    
    return breakdown;
  }, [checkIns]);

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

  // Calculate monthly income from bank transactions with type='Credit' (deposits/income)
  const monthlyIncome = useMemo(() => {
    return bankTransactions
      .filter(tx => tx.type === 'Credit' || tx.category === 'income')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [bankTransactions]);

  // Calculate total emotional spending (excluding income)
  const emotionalSpending = useMemo(() => {
    return checkIns
      .filter(tx => tx.category !== 'income')
      .reduce((sum, checkIn) => sum + (checkIn.amountValue || 0), 0);
  }, [checkIns]);

  // Calculate spending by mood (for bar chart)
  const spendingByMood = useMemo(() => {
    if (checkIns.length === 0) {
      return [];
    }

    const moodAmounts = {};
    const moodCounts = {};
    
    checkIns.forEach(tx => {
      const mood = (tx.emotion || 'neutral').toLowerCase();
      moodAmounts[mood] = (moodAmounts[mood] || 0) + (tx.amountValue || 0);
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    return Object.keys(moodAmounts).map(mood => ({
      mood: mood,
      amount: moodAmounts[mood],
      count: moodCounts[mood]
    })).sort((a, b) => b.amount - a.amount);
  }, [checkIns]);

  // Calculate spending by category and mood
  const spendingByCategoryMood = useMemo(() => {
    if (checkIns.length === 0) {
      return [];
    }

    const categoryMoodMap = {};
    
    checkIns.forEach(tx => {
      const category = tx.category || 'other';
      const mood = (tx.emotion || 'neutral').toLowerCase();
      const key = `${category}_${mood}`;
      
      if (!categoryMoodMap[key]) {
        categoryMoodMap[key] = {
          category,
          mood,
          amount: 0,
          count: 0
        };
      }
      
      categoryMoodMap[key].amount += tx.amountValue || 0;
      categoryMoodMap[key].count += 1;
    });

    return Object.values(categoryMoodMap).sort((a, b) => b.amount - a.amount);
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

  // Refresh data from MongoDB (call this after saving a new transaction)
  const refreshData = async () => {
    try {
      console.log('🔄 Refreshing data...');
      const [emotionalResponse, bankResponse] = await Promise.all([
        getEmotionalTransactions('default', 100),
        getBankTransactions()
      ]);
      
      const transformedData = (emotionalResponse.transactions || []).map(tx => ({
        id: tx._id,
        label: tx.merchant || 'Unknown',
        category: tx.category || 'other',
        amount: `$${Number(tx.amount || 0).toFixed(2)}`,
        note: tx.context || tx.transcript || '',
        icon: getIconForMerchant(tx.merchant || '', tx.category || ''),
        amountType: 'negative',
        emotion: tx.emotion ? (tx.emotion.charAt(0).toUpperCase() + tx.emotion.slice(1)) : 'Stress',
        amountValue: Number(tx.amount || 0),
        timestamp: tx.entry_time
      }));
      
      setCheckIns(transformedData);
      setBankTransactions(bankResponse.transactions || []);
      console.log('✅ Data refreshed successfully');
    } catch (err) {
      console.error('❌ Failed to refresh data:', err);
    }
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

  // Calculate spending by category from checkIns (excluding income)
  const spendingByCategory = useMemo(() => {
    const categories = {};
    checkIns
      .filter(checkIn => checkIn.category !== 'income') // Exclude income transactions
      .forEach(checkIn => {
        // Use category field, format it nicely
        const category = checkIn.category || 'other';
        const formattedCategory = category
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        if (!categories[formattedCategory]) {
          categories[formattedCategory] = 0;
        }
        categories[formattedCategory] += checkIn.amountValue || 0;
      });

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      total,
      percentage: total > 0 ? Math.round((amount / total) * 100 * 10) / 10 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [checkIns]);

  // Calculate emotional triggers count from checkIns
  const emotionalTriggers = useMemo(() => {
    const triggers = {};
    checkIns.forEach(checkIn => {
      const emotion = checkIn.emotion || extractEmotion(checkIn.note || '');
      triggers[emotion] = (triggers[emotion] || 0) + 1;
    });

    return Object.entries(triggers)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count);
  }, [checkIns]);

  // Calculate weekly summary stats from checkIns
  const weeklySummary = useMemo(() => {
    if (checkIns.length === 0) {
      return {
        lateEveningPercentage: 0,
        topMoodTrigger: null,
        topMoodPercentage: 0
      };
    }

    // Calculate late evening purchases (8pm - 6am) from timestamps
    const lateEvening = checkIns.filter(tx => {
      if (!tx.timestamp) return false;
      const date = new Date(tx.timestamp);
      const hour = date.getHours();
      return hour >= 20 || hour <= 6;
    });
    const lateEveningPercentage = Math.round((lateEvening.length / checkIns.length) * 100);

    // Get top mood trigger
    const topMood = moodBreakdown.length > 0 ? moodBreakdown[0] : null;

    return {
      lateEveningPercentage,
      topMoodTrigger: topMood?.mood || null,
      topMoodPercentage: topMood?.percentage || 0
    };
  }, [checkIns, moodBreakdown]);

  const value = {
    checkIns,
    refreshData,
    recentCheckIns,
    emotionBreakdown,
    emotionalSpending,
    invisibleSpending,
    spendingByCategory,
    emotionalTriggers,
    totalSpent: emotionalSpending,
    isLoading,
    error,
    // New mood-based data
    moodBreakdown,
    spendingByMood,
    spendingByCategoryMood,
    weeklySummary,
    
    // Income tracking
    monthlyIncome
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

