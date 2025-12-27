import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrendingUp } from 'lucide-react';

interface ProgressChartProps {
  data: {
    date: string;
    score: number;
    technical?: number;
    communication?: number;
  }[];
  title?: string;
}

export function ProgressChart({ data, title = "Progress Over Time" }: ProgressChartProps) {
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(180, 100%, 50%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(180, 100%, 50%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="technicalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(270, 100%, 65%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(270, 100%, 65%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 32%, 20%)" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(215, 20%, 65%)"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 65%)"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 10%)',
                border: '1px solid hsl(217, 32%, 25%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="score"
              name="Overall Score"
              stroke="hsl(180, 100%, 50%)"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
            {data[0]?.technical !== undefined && (
              <Area
                type="monotone"
                dataKey="technical"
                name="Technical"
                stroke="hsl(270, 100%, 65%)"
                strokeWidth={2}
                fill="url(#technicalGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
