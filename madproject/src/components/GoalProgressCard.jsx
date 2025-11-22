import './GoalProgressCard.css';

function GoalProgressCard({ goalLabel, current, target }) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const progressWidth = `${percentage}%`;

  return (
    <div className="goal-progress-card card-dark">
      <div className="goal-header">
        <div className="goal-label muted-text">{goalLabel}</div>
        <div className="goal-percentage">{Math.round(percentage)}%</div>
      </div>
      <div className="goal-numbers">
        <span className="goal-current number-display">${current.toLocaleString()}</span>
        <span className="goal-separator muted-text">/</span>
        <span className="goal-target muted-text">${target.toLocaleString()}</span>
      </div>
      <div className="goal-progress-bar">
        <div 
          className="goal-progress-fill" 
          style={{ width: progressWidth }}
        />
      </div>
    </div>
  );
}

export default GoalProgressCard;

