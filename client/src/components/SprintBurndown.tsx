import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingDown, Calendar, Target } from 'lucide-react';

function getCSSVariable(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

interface SprintBurndownProps {
  activeSprint: any;
  backlogItems: any[];
}

export function SprintBurndown({ activeSprint, backlogItems }: SprintBurndownProps) {
  if (!activeSprint) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="mb-6">Sprint Burndown</h3>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No active sprint</p>
          <p className="text-sm text-muted-foreground mt-2">Start a sprint to see burndown chart</p>
        </div>
      </div>
    );
  }

  // Calculate sprint data
  const sprintItems = backlogItems.filter(item => item.sprintId === activeSprint._id);
  const totalPoints = sprintItems.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
  const completedItems = sprintItems.filter(item => item.status === 'done');
  const completedPoints = completedItems.reduce((sum, item) => sum + (item.storyPoints || 0), 0);
  const remainingPoints = totalPoints - completedPoints;

  // Calculate days
  const startDate = new Date(activeSprint.actualStartDate || activeSprint.startDate);
  const endDate = new Date(activeSprint.endDate);
  const today = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.min(Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), totalDays);
  const daysRemaining = Math.max(totalDays - daysElapsed, 0);
  const completionPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Generate burndown data
  const burndownData: Array<{ day: string; ideal: number; actual: number | null }> = [];
  for (let i = 0; i <= totalDays; i++) {
    const idealRemaining = totalPoints - (totalPoints / totalDays) * i;
    const actualRemaining = i <= daysElapsed ? totalPoints - (completedPoints / daysElapsed) * i : null;
    burndownData.push({
      day: `Day ${i + 1}`,
      ideal: Math.max(0, idealRemaining), // Keep decimal precision for smooth ideal line
      actual: actualRemaining !== null ? Math.round(Math.max(0, actualRemaining)) : null,
    });
  }
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOnTrack = completionPercentage >= (daysElapsed / totalDays) * 100;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="mb-1">{activeSprint.name} Burndown</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(activeSprint.actualStartDate || activeSprint.startDate)} - {formatDate(activeSprint.endDate)}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${isOnTrack ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
          }`}>
          <TrendingDown className="w-4 h-4" />
          {isOnTrack ? 'On Track' : 'Needs Attention'}
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
          <LineChart data={burndownData}>
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
              formatter={(value: any, name: string) => {
                if (name === 'Ideal Burndown' && typeof value === 'number') {
                  return [value.toFixed(2), name];
                }
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{ color: chartColors.foreground }} />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Ideal Burndown"
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke={chartColors.primary}
              strokeWidth={3}
              dot={{ fill: chartColors.primary, r: 4 }}
              name="Actual Progress"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {totalPoints > 0 && (
        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm">
            <span className="text-primary">💡 AI Insight:</span>{' '}
            {isOnTrack
              ? `Your team is on track with ${completionPercentage}% completion. Keep up the good work!`
              : `Your team has completed ${completionPercentage}% with ${daysRemaining} days remaining. Consider reviewing blockers or adjusting scope.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
