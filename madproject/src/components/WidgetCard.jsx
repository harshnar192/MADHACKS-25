import { useState } from 'react';
import './WidgetCard.css';

function WidgetCard({ 
  title, 
  subtitle, 
  children, 
  accent, 
  interactive = false,
  onClick,
  expanded: initialExpanded = false,
  collapsible = false
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [isHovered, setIsHovered] = useState(false);

  const accentClass = accent ? `accent-${accent}` : '';
  const interactiveClass = interactive ? 'widget-interactive' : '';
  const expandedClass = expanded ? 'widget-expanded' : '';

  const handleClick = () => {
    if (collapsible) {
      setExpanded(!expanded);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`widget-card card-dark ${accentClass} ${interactiveClass} ${expandedClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {(title || subtitle) && (
        <div className="widget-header">
          {title && <h3 className="widget-title">{title}</h3>}
          {subtitle && <p className="widget-subtitle muted-text">{subtitle}</p>}
          {collapsible && (
            <button 
              className="widget-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? '−' : '+'}
            </button>
          )}
        </div>
      )}
      
      <div className={`widget-content ${expanded ? 'expanded' : ''}`}>
        {children}
      </div>
      
      {isHovered && interactive && (
        <div className="widget-hover-indicator">
          <span>Click to interact →</span>
        </div>
      )}
    </div>
  );
}

export default WidgetCard;

