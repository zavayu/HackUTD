import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, Users, Target, AlertCircle, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GitHubMetrics } from './GitHubMetrics';
import { GitHubCommitFeed } from './GitHubCommitFeed';
import { GitHubPRTracker } from './GitHubPRTracker';
import { GitHubAIInsights } from './GitHubAIInsights';
import { useGitHub } from './GitHubContext';

// Sprint velocity data
const sprintVelocityData = [
  { sprint: 'S1', completed: 45, planned: 50 },
  { sprint: 'S2', completed: 52, planned: 55 },
  { sprint: 'S3', completed: 58, planned: 60 },
  { sprint: 'S4', completed: 55, planned: 58 },
  { sprint: 'S5', completed: 62, planned: 65 },
  { sprint: 'S6', completed: 62, planned: 68 },
];

// Epic progress data (colors will be computed dynamically)
const epicProgressData = [
  { name: 'User Auth', value: 85 },
  { name: 'Dashboard', value: 60 },
  { name: 'Analytics', value: 40 },
  { name: 'Mobile App', value: 25 },
];

// Team performance data
const teamPerformanceData = [
  { member: 'Sarah Chen', completed: 18, inProgress: 3 },
  { member: 'Mike Johnson', completed: 15, inProgress: 4 },
  { member: 'Alex Kim', completed: 17, inProgress: 2 },
  { member: 'Emma Davis', completed: 12, inProgress: 3 },
];

interface KPICardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string | number;
  trend?: string;
  trendColor: string;
  trendIcon?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ icon, iconBg, title, value, trend, trendColor, trendIcon }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`${iconBg} rounded-xl p-2.5 flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${trendColor} text-xs`}>
            {trendIcon}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-2">{title}</p>
      <p className="text-foreground text-2xl">{value}</p>
    </div>
  );
};

export const AIInsightsView: React.FC = () => {
  const { isConnected } = useGitHub();
  const [chartColors, setChartColors] = useState({
    primary: '#3b82f6',
    chart1: '#3b82f6',
    chart2: '#14b8a6',
    chart3: '#a78bfa',
    chart4: '#f59e0b',
    chart5: '#10b981',
    grid: 'rgba(255,255,255,0.1)',
    axis: '#a1a1a1',
    tooltip: {
      bg: 'rgb(10, 10, 10)',
      border: 'rgb(38, 38, 38)',
    },
  });

  // Get theme colors from CSS variables
  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      
      const primary = style.getPropertyValue('--color-primary').trim() || '#3b82f6';
      const chart1 = style.getPropertyValue('--color-chart-1').trim() || primary;
      const chart2 = style.getPropertyValue('--color-chart-2').trim() || '#14b8a6';
      const chart3 = style.getPropertyValue('--color-chart-3').trim() || '#a78bfa';
      const chart4 = style.getPropertyValue('--color-chart-4').trim() || '#f59e0b';
      const chart5 = style.getPropertyValue('--color-chart-5').trim() || '#10b981';
      const border = style.getPropertyValue('--color-border').trim() || 'rgba(255,255,255,0.1)';
      const muted = style.getPropertyValue('--color-muted-foreground').trim() || '#a1a1a1';
      const cardBg = style.getPropertyValue('--color-card').trim() || 'rgb(10, 10, 10)';
      
      setChartColors({
        primary,
        chart1,
        chart2,
        chart3,
        chart4,
        chart5,
        grid: border,
        axis: muted,
        tooltip: {
          bg: cardBg,
          border: border,
        },
      });
    };

    updateColors();

    // Watch for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-foreground text-xl">AI-Powered Insights</h1>
        <p className="text-muted-foreground">Data-driven analytics for your product development</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<TrendingUp className="w-5 h-5" style={{ color: chartColors.chart2 }} />}
          iconBg="bg-accent"
          title="Sprint Completion"
          value="95%"
          trend="+12%"
          trendColor="text-foreground"
          trendIcon={<TrendingUp className="w-3 h-3" />}
        />
        <KPICard
          icon={<Zap className="w-5 h-5" style={{ color: chartColors.primary }} />}
          iconBg="bg-accent"
          title="Team Velocity"
          value="62"
          trend="+8%"
          trendColor="text-foreground"
          trendIcon={<TrendingUp className="w-3 h-3" />}
        />
        <KPICard
          icon={<Target className="w-5 h-5" style={{ color: chartColors.chart3 }} />}
          iconBg="bg-accent"
          title="Release Goal"
          value="Nov 14"
          trend="On track"
          trendColor="text-foreground"
        />
        <KPICard
          icon={<AlertCircle className="w-5 h-5" style={{ color: chartColors.chart4 }} />}
          iconBg="bg-accent"
          title="Blockers"
          value="3"
          trend="-2 from last"
          trendColor="text-foreground"
          trendIcon={<TrendingDown className="w-3 h-3" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Velocity Trend */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-foreground">Sprint Velocity Trend</h3>
            <span className="text-muted-foreground text-sm">Last 6 sprints</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sprintVelocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="sprint" stroke={chartColors.axis} />
              <YAxis stroke={chartColors.axis} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltip.bg,
                  border: `1px solid ${chartColors.tooltip.border}`,
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
                labelStyle={{ color: 'var(--color-foreground)' }}
              />
              <Legend wrapperStyle={{ color: 'var(--color-foreground)' }} />
              <Line
                type="monotone"
                dataKey="completed"
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ fill: chartColors.primary, r: 5 }}
                name="Completed"
              />
              <Line
                type="monotone"
                dataKey="planned"
                stroke={chartColors.axis}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'transparent', r: 0 }}
                name="Planned"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Epic Progress */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-foreground">Epic Progress</h3>
            <span className="text-muted-foreground text-sm">Completion %</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={epicProgressData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={100}
                fill={chartColors.chart1}
                dataKey="value"
                stroke="none"
              >
                {epicProgressData.map((entry, index) => {
                  const colors = [chartColors.chart1, chartColors.chart2, chartColors.chart3, chartColors.chart4, chartColors.chart5];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltip.bg,
                  border: `1px solid ${chartColors.tooltip.border}`,
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
                labelStyle={{ color: 'var(--color-foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Performance Chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground">Team Performance</h3>
          <span className="text-muted-foreground text-sm">Current sprint</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={teamPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="member" stroke={chartColors.axis} />
            <YAxis stroke={chartColors.axis} />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.tooltip.bg,
                border: `1px solid ${chartColors.tooltip.border}`,
                borderRadius: '8px',
                color: 'var(--color-foreground)',
              }}
              labelStyle={{ color: 'var(--color-foreground)' }}
            />
            <Legend wrapperStyle={{ color: 'var(--color-foreground)' }} />
            <Bar dataKey="completed" fill={chartColors.chart2} name="Completed" radius={[8, 8, 0, 0]} />
            <Bar dataKey="inProgress" fill={chartColors.chart4} name="In Progress" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GitHub Integration Section */}
      {isConnected && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: chartColors.primary }} />
            <h2 className="text-foreground text-xl">GitHub Integration</h2>
          </div>

          {/* GitHub Metrics */}
          <GitHubMetrics />

          {/* GitHub Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GitHubCommitFeed />
            <GitHubPRTracker />
          </div>

          {/* GitHub AI Insights */}
          <GitHubAIInsights />
        </div>
      )}

      {/* AI Recommendations */}
      <div className="border border-border rounded-2xl p-6 bg-accent/30">
        <div className="flex gap-4">
          <div className="rounded-2xl p-3 flex items-center justify-center h-12 w-12 shrink-0" style={{ backgroundColor: `${chartColors.primary}20` }}>
            <Sparkles className="w-6 h-6" style={{ color: chartColors.primary }} />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-foreground text-lg">AI Recommendations</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: chartColors.primary }} />
                <div>
                  <span className="text-foreground">Sprint Velocity: </span>
                  <span className="text-muted-foreground">
                    Your team's velocity has increased 8% over the last 3 sprints. Consider increasing story point capacity for the next sprint.
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: chartColors.primary }} />
                <div>
                  <span className="text-foreground">Blocked Tasks: </span>
                  <span className="text-muted-foreground">
                    3 tasks have been blocked for more than 2 days. Recommended action: Reassign to available team members or resolve dependencies.
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: chartColors.primary }} />
                <div>
                  <span className="text-foreground">Release Timeline: </span>
                  <span className="text-muted-foreground">
                    User Authentication epic is 85% complete and on track for Nov 14 release. Focus remaining effort on OAuth implementation to meet deadline.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
