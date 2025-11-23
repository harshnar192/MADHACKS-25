import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './EmotionPieChart.css';

function EmotionPieChart({ data, moodData }) {
  // Map emotion colors to hex values - matching the dashboard colors
  const colorMap = {
    warning: '#FBBF24', // Yellow-brown (Tired)
    danger: '#f28b82', // Red-brown (Stress) - matches theme accent-danger
    success: '#81c995', // Green (Deserved) - matches theme accent-success
    primary: '#8ab4f8',  // Blue (if needed)
    // Mood-based colors
    anxious: '#f28b82',
    tired: '#FBBF24',
    stressed: '#ef4444',
    happy: '#81c995',
    peer_pressure: '#8ab4f8'
  };

  // If moodData is provided, use it instead
  let chartData;
  if (moodData && moodData.length > 0) {
    chartData = moodData.map(item => ({
      name: item.mood.charAt(0).toUpperCase() + item.mood.slice(1).replace('_', ' '), // Format: "Anxious", "Peer Pressure"
      value: item.percentage,
      count: item.count, // Include count for tooltip
      color: colorMap[item.mood] || colorMap.primary
    }));
  } else {
    // Transform legacy data format
    chartData = data.map(item => ({
    name: item.label,
    value: item.percentage,
      count: item.count,
    color: colorMap[item.color] || colorMap.primary
  }));
  }

  // Custom label function
  const renderLabel = (entry) => {
    return `${entry.name}: ${entry.value}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="pie-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">{data.value}%</p>
          {data.count !== undefined && (
            <p className="tooltip-count">{data.count} {data.count === 1 ? 'purchase' : 'purchases'}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="emotion-pie-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: '13px' }}>
                {value}: {entry.payload.value}% {entry.payload.count !== undefined ? `(${entry.payload.count})` : ''}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EmotionPieChart;
