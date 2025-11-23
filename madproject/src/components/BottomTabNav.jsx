import { NavLink } from 'react-router-dom';
import './BottomTabNav.css';

function BottomTabNav() {
  const tabs = [
    { path: '/', label: 'Insights', icon: '📊' },
    { path: '/check-in', label: 'Check-in', icon: '✍️' },
    { path: '/summary', label: 'Summary', icon: '📋' },
    // { path: '/voice', label: 'Voice', icon: '🎤' }, // Removed - redundant with Check-in
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/transactions', label: 'Transactions', icon: '💳' },
  ];

  return (
    <nav className="bottom-tab-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `bottom-tab-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomTabNav;

