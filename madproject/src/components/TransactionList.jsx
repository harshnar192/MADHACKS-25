import './TransactionList.css';

function TransactionList({ items = [] }) {
  return (
    <div className="transaction-list">
      {items.map((item, index) => (
        <div key={index} className="transaction-item">
          <div className="transaction-left">
            {item.icon && <span className="transaction-icon">{item.icon}</span>}
            <div className="transaction-info">
              <div className="transaction-label">{item.label}</div>
              {item.note && (
                <div className="transaction-note muted-text">{item.note}</div>
              )}
            </div>
          </div>
          <div className="transaction-amount">
            <span className={`amount-value ${item.amountType || 'default'}`}>
              {item.amount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;

