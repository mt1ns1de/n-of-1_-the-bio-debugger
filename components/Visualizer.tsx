import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DataPoint } from '../types';

interface Props {
  data: DataPoint[];
  interventionDate: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-lg">
        <p className="text-slate-200 font-mono text-sm">{label}</p>
        <p className="text-emerald-400 font-bold text-sm">
          Value: {payload[0].value}
        </p>
        {payload[0].payload.isOutlier && (
          <p className="text-red-400 text-xs font-bold uppercase">Outlier Ignored</p>
        )}
      </div>
    );
  }
  return null;
};

const Visualizer: React.FC<Props> = ({ data, interventionDate }) => {
  // Separate cleaned data vs outliers for visualization if needed, 
  // but simpler to just show all and color outliers differently? 
  // Recharts doesn't support point-by-point coloring easily in LineChart without custom dots.
  // We will map data to indicate outliers.

  const chartData = data.map(d => ({
    ...d,
    displayValue: d.isOutlier ? d.value : d.value, // Just to be explicit
    color: d.isOutlier ? '#ef4444' : '#10b981'
  }));

  const splitTimestamp = new Date(interventionDate).getTime();
  
  // Find min/max for domain
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1;

  return (
    <div className="w-full h-[400px] bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <h4 className="text-slate-400 text-sm font-mono mb-4 text-center">TIME SERIES ANALYSIS (PRE vs POST)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            tick={{ fontSize: 12 }} 
            tickFormatter={(str) => {
                const d = new Date(str);
                return `${d.getMonth()+1}/${d.getDate()}`;
            }}
          />
          <YAxis stroke="#64748b" domain={[min - padding, max + padding]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <ReferenceLine 
            x={interventionDate} 
            stroke="#f59e0b" 
            strokeDasharray="5 5" 
            label={{ value: "INTERVENTION", position: 'insideTopLeft', fill: '#f59e0b', fontSize: 12 }} 
          />

          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isOutlier) {
                    return <circle cx={cx} cy={cy} r={4} stroke="none" fill="#ef4444" key={`dot-${payload.date}`} />;
                }
                return <circle cx={cx} cy={cy} r={3} stroke="none" fill="#3b82f6" key={`dot-${payload.date}`} />;
            }}
            activeDot={{ r: 6 }}
            name="Biometric Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Visualizer;