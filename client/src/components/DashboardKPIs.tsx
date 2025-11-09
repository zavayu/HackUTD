import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, Rocket, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from 'recharts';

const velocityData = [
  { sprint: 1, points: 45 },
  { sprint: 2, points: 52 },
  { sprint: 3, points: 48 },
  { sprint: 4, points: 58 },
  { sprint: 5, points: 62 },
  { sprint: 6, points: 55 },
  { sprint: 7, points: 60 },
];

const issuesData = [
  { day: 1, count: 12 },
  { day: 2, count: 15 },
  { day: 3, count: 11 },
  { day: 4, count: 18 },
  { day: 5, count: 14 },
  { day: 6, count: 16 },
  { day: 7, count: 13 },
];

function getCSSVariable(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

export function DashboardKPIs() {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');

  useEffect(() => {
    const updateColors = () => {
      setPrimaryColor(getCSSVariable('--primary'));
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);
  const kpis = [
    {
      label: 'Sprint Velocity',
      value: '60',
      unit: 'pts',
      change: '+8.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      chart: (
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={velocityData}>
            <Line
              type="monotone"
              dataKey="points"
              stroke={primaryColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      label: 'Active Issues',
      value: '13',
      unit: 'tasks',
      change: '-12%',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      chart: (
        <ResponsiveContainer width="100%" height={40}>
          <BarChart data={issuesData}>
            <Bar dataKey="count" fill={primaryColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      label: 'Upcoming Release',
      value: '7',
      unit: 'days',
      change: 'On track',
      trend: 'neutral',
      icon: Rocket,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      chart: (
        <div className="flex items-end gap-1 h-10">
          {[60, 70, 65, 85, 75, 90, 95].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/30 rounded-t"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      ),
    },
    {
      label: 'Team Activity',
      value: '94',
      unit: '%',
      change: '+5%',
      trend: 'up',
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      chart: (
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={velocityData}>
            <Line
              type="monotone"
              dataKey="points"
              stroke={primaryColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                <div className="flex items-baseline gap-1">
                  <h2>{kpi.value}</h2>
                  <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="mb-2">{kpi.chart}</div>
            <div className="flex items-center gap-1">
              <span
                className={`text-xs ${
                  kpi.trend === 'up'
                    ? 'text-green-500'
                    : kpi.trend === 'down'
                    ? 'text-blue-500'
                    : 'text-muted-foreground'
                }`}
              >
                {kpi.change}
              </span>
              <span className="text-xs text-muted-foreground">vs last sprint</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
