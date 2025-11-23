import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './MoodInsightsChart.css';

// Mood color mapping
const moodColors = {
  anxious: '#f28b82',      // Red (stress/anxiety)
  tired: '#FBBF24',        // Yellow (tired)
  stressed: '#ef4444',     // Dark red (stressed)
  happy: '#81c995',        // Green (happy/deserved)
  peer_pressure: '#8ab4f8', // Blue (peer pressure)
  neutral: '#94a3b8'       // Gray (neutral)
};

function MoodInsightsChart({ data, type = 'bar' }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="mood-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">
            ${payload[0].value.toFixed(2)} ({payload[0].payload.count} purchases)
          </p>
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <div className="mood-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="mood" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => (
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
              )}
            />
            <Bar dataKey="amount" name="Spending" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={moodColors[entry.mood] || moodColors.neutral} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className="mood-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {Object.keys(moodColors).filter(mood => mood !== 'neutral').map(mood => (
              <Line
                key={mood}
                type="monotone"
                dataKey={mood}
                stroke={moodColors[mood]}
                strokeWidth={2}
                dot={{ r: 4 }}
                name={mood.charAt(0).toUpperCase() + mood.slice(1)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}

export default MoodInsightsChart;

