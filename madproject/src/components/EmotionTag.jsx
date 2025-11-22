import './EmotionTag.css';

function EmotionTag({ label, percentage, color = 'primary' }) {
  const colorClass = `emotion-tag-${color}`;

  return (
    <span className={`emotion-tag pill-tag ${colorClass}`}>
      <span className="emotion-label">{label}</span>
      {percentage !== undefined && (
        <span className="emotion-percentage">{percentage}%</span>
      )}
    </span>
  );
}

export default EmotionTag;

