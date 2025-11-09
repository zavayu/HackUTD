import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingDown, Calendar, Target } from 'lucide-react';

const burndownData = [
  { day: 'Day 1', ideal: 60, actual: 60, date: 'Nov 1' },
  { day: 'Day 2', ideal: 55, actual: 58, date: 'Nov 2' },
  { day: 'Day 3', ideal: 50, actual: 55, date: 'Nov 3' },
  { day: 'Day 4', ideal: 45, actual: 50, date: 'Nov 4' },
  { day: 'Day 5', ideal: 40, actual: 45, date: 'Nov 5' },
  { day: 'Day 6', ideal: 35, actual: 38, date: 'Nov 6' },
  { day: 'Day 7', ideal: 30, actual: 32, date: 'Nov 7' },
  { day: 'Day 8', ideal: 25, actual: 25, date: 'Nov 8' },
  { day: 'Day 9', ideal: 20, actual: null, date: 'Nov 9' },
  { day: 'Day 10', ideal: 15, actual: null, date: 'Nov 10' },
  { day: 'Day 11', ideal: 10, actual: null, date: 'Nov 11' },
  { day: 'Day 12', ideal: 5, actual: null, date: 'Nov 12' },
  { day: 'Day 13', ideal: 2, actual: null, date: 'Nov 13' },
  { day: 'Day 14', ideal: 0, actual: null, date: 'Nov 14' },
];

function getCSSVariable(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

export function SprintBurndown() {
  const [chartColors, setChartColors] = useState({
    primary: '#3b82f6',
    muted: '#9ca3af',
    foreground: '#000000',
    card: '#ffffff',
    border: '#e5e7eb',
  });

  useEffect(() => {
    const updateColors = () => {
      setChartColors({
        primary: getCSSVariable('--primary'),
        muted: getCSSVariable('--muted-foreground'),
        foreground: getCSSVariable('--foreground'),
        card: getCSSVariable('--card'),
        border: getCSSVariable('--border'),
      });
    };

    updateColors();

    // Listen for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);
  const totalPoints = 60;
  const completedPoints = 35;
  const remainingPoints = totalPoints - completedPoints;
  const daysElapsed = 8;
  const totalDays = 14;
  const daysRemaining = totalDays - daysElapsed;
  const completionPercentage = Math.round((completedPoints / totalPoints) * 100);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="mb-1">Sprint 23 Burndown</h3>
          <p className="text-sm text-muted-foreground">Nov 1 - Nov 14, 2025</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-sm">
          <TrendingDown className="w-4 h-4" />
          On Track
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-accent/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm">Total Points</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl">{totalPoints}</span>
            <span className="text-sm text-muted-foreground">pts</span>
          </div>
        </div>

        <div className="bg-accent/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">Completed</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl text-green-500">{completedPoints}</span>
            <span className="text-sm text-muted-foreground">pts ({completionPercentage}%)</span>
          </div>
        </div>

        <div className="bg-accent/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Days Remaining</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl">{daysRemaining}</span>
            <span className="text-sm text-muted-foreground">of {totalDays}</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={burndownData}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} opacity={0.5} />
            <XAxis
              dataKey="day"
              tick={{ fill: chartColors.muted, fontSize: 12 }}
              stroke={chartColors.border}
            />
            <YAxis
              label={{
                value: 'Story Points',
                angle: -90,
                position: 'insideLeft',
                style: { fill: chartColors.muted, fontSize: 12 },
              }}
              tick={{ fill: chartColors.muted, fontSize: 12 }}
              stroke={chartColors.border}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.card,
                border: `1px solid ${chartColors.border}`,
                borderRadius: '8px',
                padding: '8px 12px',
                color: chartColors.foreground,
              }}
              labelStyle={{ color: chartColors.foreground }}
              itemStyle={{ color: chartColors.foreground }}
            />
            <Legend wrapperStyle={{ color: chartColors.foreground }} />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke={chartColors.muted}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Ideal Progress"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke={chartColors.primary}
              strokeWidth={3}
              fill="url(#colorActual)"
              dot={{ fill: chartColors.primary, r: 4 }}
              name="Actual Progress"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm">
          <span className="text-primary">💡 AI Insight:</span> Your team is tracking 3 points
          ahead of the ideal burndown. At this pace, you'll complete the sprint{' '}
          <span>1-2 days early</span>. Consider pulling in 1-2 additional stories from the
          backlog.
        </p>
      </div>
    </div>
  );
}
