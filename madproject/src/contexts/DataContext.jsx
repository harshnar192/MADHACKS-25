import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getEmotionalTransactions } from '../services/api';

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
  // Fetch from MongoDB instead of localStorage
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch emotional transactions from MongoDB on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const response = await getEmotionalTransactions('default', 100);
        
        // Transform MongoDB documents to the format expected by UI
        const transformedData = (response.transactions || []).map(tx => ({
          id: tx._id,
          label: tx.merchant || 'Unknown',
          amount: `$${Number(tx.amount || 0).toFixed(2)}`,
          note: tx.context || tx.transcript || '',
          icon: getIconForMerchant(tx.merchant || ''),
          amountType: 'negative',
          emotion: tx.emotion ? (tx.emotion.charAt(0).toUpperCase() + tx.emotion.slice(1)) : 'Stress',
          amountValue: Number(tx.amount || 0),
          timestamp: tx.entry_time
        }));

        setCheckIns(transformedData);
        setError(null);
      } catch (err) {
        console.error('Failed to load emotional transactions:', err);
        setError(err.message);
        setCheckIns([]); // Empty state on error
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

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

  // Refresh data from MongoDB (call this after saving a new transaction)
  const refreshData = async () => {
    try {
      const response = await getEmotionalTransactions('default', 100);
      const transformedData = (response.transactions || []).map(tx => ({
        id: tx._id,
        label: tx.merchant || 'Unknown',
        amount: `$${Number(tx.amount || 0).toFixed(2)}`,
        note: tx.context || tx.transcript || '',
        icon: getIconForMerchant(tx.merchant || ''),
        amountType: 'negative',
        emotion: tx.emotion ? (tx.emotion.charAt(0).toUpperCase() + tx.emotion.slice(1)) : 'Stress',
        amountValue: Number(tx.amount || 0),
        timestamp: tx.entry_time
      }));
      setCheckIns(transformedData);
    } catch (err) {
      console.error('Failed to refresh data:', err);
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
    refreshData,
    recentCheckIns,
    emotionBreakdown,
    emotionalSpending,
    invisibleSpending,
    spendingByCategory,
    emotionalTriggers,
    totalSpent: emotionalSpending,
    isLoading,
    error
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

