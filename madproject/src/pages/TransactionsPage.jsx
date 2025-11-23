import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { getBankTransactions, getImpulsivePurchases } from '../services/api';
import './TransactionsPage.css';

// Helper function to get icon based on merchant/category
function getIconForMerchant(merchant, category) {
  const lower = (merchant || '').toLowerCase();
  const catLower = (category || '').toLowerCase();
  
  if (lower.includes('starbucks') || lower.includes('coffee') || lower.includes('cafe') || lower.includes('dunkin') || lower.includes('peet') || catLower === 'coffee') return '☕';
  if (lower.includes('amazon') || lower.includes('best buy') || lower.includes('apple store') || lower.includes('nike') || lower.includes('home depot') || catLower === 'shopping') return '📦';
  if (lower.includes('uber') && !lower.includes('eats') || lower.includes('lyft') || lower.includes('metro') || catLower === 'transport') return '🚗';
  if (lower.includes('uber eats') || lower.includes('doordash') || lower.includes('grubhub') || lower.includes('postmates') || catLower === 'food_delivery') return '🍔';
  if (lower.includes('snack') || lower.includes('convenience') || lower.includes('vending') || lower.includes('7-eleven') || lower.includes('cvs') || lower.includes('walgreens') || catLower === 'snacks') return '🍫';
  if (catLower === 'alcohol' || lower.includes('bar') || lower.includes('lounge') || lower.includes('liquor')) return '🍷';
  if (catLower === 'groceries' || lower.includes('whole foods') || lower.includes('trader joe') || lower.includes('costco') || lower.includes('safeway') || lower.includes('walmart') || lower.includes('target') || lower.includes('aldi')) return '🛒';
  if (catLower === 'subscriptions' || lower.includes('netflix') || lower.includes('spotify') || lower.includes('hulu') || lower.includes('disney') || lower.includes('apple') && !lower.includes('store')) return '📺';
  if (catLower === 'bills' || lower.includes('electric') || lower.includes('gas company') || lower.includes('internet') || lower.includes('phone') || lower.includes('utility')) return '💡';
  if (catLower === 'dining_out' || lower.includes('chipotle') || lower.includes('mcdonald') || lower.includes('taco bell') || lower.includes('pizza') || lower.includes('olive garden') || lower.includes('panera') || lower.includes('subway')) return '🍽️';
  if (catLower === 'gas' || lower.includes('shell') || lower.includes('exxon') || lower.includes('chevron') || lower.includes('bp') || lower.includes('mobil')) return '⛽';
  return '💰';
}

// Helper function to format date nicely
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
}

// Helper function to format category name
function formatCategory(category) {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function TransactionsPage() {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightMood, setHighlightMood] = useState(null);

  useEffect(() => {
    // Get mood filter from navigation state
    if (location.state?.highlightMood || location.state?.filterByMood) {
      setHighlightMood(location.state.highlightMood || location.state.filterByMood);
    }
  }, [location.state]);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        
        // If we have a mood filter, load from impulsive purchases
        if (highlightMood) {
          const impulsiveData = await getImpulsivePurchases();
          const filteredTransactions = impulsiveData.transactions
            .filter(tx => (tx.mood || 'neutral').toLowerCase() === highlightMood.toLowerCase())
            .map(tx => ({
              id: tx.id,
              merchant: tx.merchant,
              amount: tx.amount,
              category: tx.category,
              date: tx.date,
              datetime: tx.datetime,
              dayOfWeek: tx.day_of_week,
              description: tx.description,
              mood: tx.mood,
              icon: getIconForMerchant(tx.merchant, tx.category),
              formattedDate: formatDate(tx.date),
              formattedCategory: formatCategory(tx.category),
              isHighlighted: true
            }))
            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
          
          setTransactions(filteredTransactions);
        } else {
          // Load all transactions
          const data = await getBankTransactions();
          
          // Format and sort transactions (newest first)
          const formattedTransactions = data.transactions
            .map(tx => ({
              id: tx.id,
              merchant: tx.merchant,
              amount: tx.amount,
              category: tx.category,
              type: tx.type,
              date: tx.date,
              datetime: tx.datetime,
              dayOfWeek: tx.day_of_week,
              description: tx.description,
              icon: getIconForMerchant(tx.merchant, tx.category),
              formattedDate: formatDate(tx.date),
              formattedCategory: formatCategory(tx.category),
              isHighlighted: false
            }))
            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
          
          setTransactions(formattedTransactions);
        }
      } catch (err) {
        console.error('Failed to load transactions:', err);
        setError('Failed to load transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [highlightMood]);

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, tx) => {
    const date = tx.formattedDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {});

  // Format mood name for display
  const formatMoodName = (mood) => {
    if (!mood) return '';
    return mood.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Container className="py-4 transactions-page">
      <div className="page-header mb-4">
        <h2 className="text-primary mb-2">Transactions</h2>
        {highlightMood ? (
          <p className="muted-text">
            Showing {transactions.length} {formatMoodName(highlightMood)} purchases
            <button 
              className="btn btn-sm btn-link text-primary ms-2" 
              onClick={() => {
                setHighlightMood(null);
                window.history.replaceState({}, '', '/transactions');
              }}
              style={{ padding: 0, textDecoration: 'underline', border: 'none', background: 'none' }}
            >
              (Show all)
            </button>
          </p>
        ) : (
          <p className="muted-text">View all your spending transactions ({transactions.length} total)</p>
        )}
      </div>

      <div className="transactions-container">
        {loading ? (
          <div className="empty-state">
            <p className="muted-text">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p className="muted-text">{error}</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="transactions-list">
            {Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date} className="transaction-group">
                <div className="transaction-date-header">
                  <span className="date-label">{date}</span>
                  <span className="date-count">{txs.length} {txs.length === 1 ? 'transaction' : 'transactions'}</span>
                </div>
                {txs.map((tx) => (
                  <div 
                    key={tx.id} 
                    className={`transaction-item ${tx.isHighlighted ? 'transaction-highlighted' : ''}`}
                  >
                    <div className="transaction-left">
                      <div className="transaction-icon-wrapper">
                        <span className="transaction-icon">{tx.icon}</span>
                      </div>
                      <div className="transaction-info">
                        <div className="transaction-merchant">
                          {tx.merchant}
                          {tx.mood && (
                            <span className="transaction-mood-badge">
                              {formatMoodName(tx.mood)}
                            </span>
                          )}
                        </div>
                        <div className="transaction-details">
                          <span className="transaction-category">{tx.formattedCategory}</span>
                          {tx.dayOfWeek && <span className="transaction-day"> • {tx.dayOfWeek}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="transaction-amount">
                      <span className={`amount-value ${tx.type === 'Credit' ? 'positive' : 'negative'}`}>
                        {tx.type === 'Credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="muted-text">No transactions found.</p>
          </div>
        )}
      </div>
    </Container>
  );
}

export default TransactionsPage;

