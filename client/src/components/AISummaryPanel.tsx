import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function AISummaryPanel() {
  const insights = [
    {
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      title: 'Velocity increased by 8%',
      description: 'Team completed 5 more story points than last sprint',
    },
    {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      title: '2 tasks at risk',
      description: 'Authentication and Payment tasks have been in progress for 6+ days',
    },
    {
      icon: CheckCircle2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      title: '4 stories completed early',
      description: 'Mobile design and Dashboard widgets finished ahead of schedule',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3>AI Copilot Summary</h3>
            <p className="text-sm text-muted-foreground">Here's what changed this week</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">Updated 2 min ago</span>
      </div>

      <div className="space-y-3 mb-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-card/50 backdrop-blur rounded-lg border border-border/50"
            >
              <div className={`w-8 h-8 rounded-lg ${insight.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${insight.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm mb-1">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-sm">
          View Full Report
          <ArrowRight className="w-4 h-4" />
        </button>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm">
          Ask AI
        </button>
      </div>
    </div>
  );
}
