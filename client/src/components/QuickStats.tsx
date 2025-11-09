import { Users, Target, Zap, Trophy } from 'lucide-react';
import { Project } from '../types';

interface QuickStatsProps {
  project: Project;
  onManageTeam?: () => void;
}

export function QuickStats({ project, onManageTeam }: QuickStatsProps) {
  const memberCount = (project.members?.length || 0) + 1; // +1 for owner
  
  const stats = [
    {
      label: 'Team Velocity',
      value: '60 pts',
      change: '+8%',
      trend: 'up',
      icon: Zap,
    },
    {
      label: 'Sprint Goal',
      value: '58%',
      change: 'On track',
      trend: 'neutral',
      icon: Target,
    },
    {
      label: 'Team Members',
      value: memberCount.toString(),
      change: 'All active',
      trend: 'neutral',
      icon: Users,
      onClick: onManageTeam,
    },
    {
      label: 'Completed Stories',
      value: project.stats?.stories.toString() || '0',
      change: 'Total stories',
      trend: 'neutral',
      icon: Trophy,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            onClick={stat.onClick}
            className={`bg-gradient-to-br from-accent/30 to-accent/10 border border-border rounded-xl p-4 hover:shadow-md transition-all ${
              stat.onClick ? 'cursor-pointer hover:border-primary/50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-5 h-5 text-primary" />
              <span
                className={`text-xs ${
                  stat.trend === 'up'
                    ? 'text-green-500'
                    : stat.trend === 'down'
                    ? 'text-red-500'
                    : 'text-muted-foreground'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="mb-1">{stat.value}</h3>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
