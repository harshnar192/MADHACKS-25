import './InsightCard.css';

function InsightCard({ title, subtitle, children, accent }) {
  const accentClass = accent ? `accent-${accent}` : '';

  return (
    <div className={`insight-card card-dark ${accentClass}`}>
      {title && <h3 className="insight-card-title">{title}</h3>}
      {subtitle && <p className="insight-card-subtitle muted-text">{subtitle}</p>}
      {children && <div className="insight-card-content">{children}</div>}
    </div>
  );
}

export default InsightCard;

