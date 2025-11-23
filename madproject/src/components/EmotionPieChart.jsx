import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './EmotionPieChart.css';

function EmotionPieChart({ data }) {
  // Map emotion colors to hex values - matching the dashboard colors
  const colorMap = {
    warning: '#FBBF24', // Yellow-brown (Tired)
    danger: '#f28b82', // Red-brown (Stress) - matches theme accent-danger
    success: '#81c995', // Green (Deserved) - matches theme accent-success
    primary: '#8ab4f8'  // Blue (if needed)
  };

  // Transform data for the chart
  const chartData = data.map(item => ({
    name: item.label,
    value: item.percentage,
    color: colorMap[item.color] || colorMap.primary
  }));

  // Custom label function
  const renderLabel = (entry) => {
    return `${entry.name}: ${entry.value}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="pie-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{payload[0].value}%</p>
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
                {value}: {entry.payload.value}%
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EmotionPieChart;
