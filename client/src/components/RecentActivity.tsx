import { CheckCircle2, GitCommit, MessageSquare, AlertTriangle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function RecentActivity() {
  const activities = [
    {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      title: 'James Wilson completed "Mobile app responsive design"',
      time: '5 minutes ago',
      type: 'completion',
    },
    {
      icon: Sparkles,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      title: 'AI generated acceptance criteria for 3 stories',
      time: '12 minutes ago',
      type: 'ai',
    },
    {
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      title: 'Sarah Chen commented on "User authentication with SSO"',
      time: '23 minutes ago',
      type: 'comment',
    },
    {
      icon: GitCommit,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      title: 'Alex Kumar moved "Real-time collaboration" to In Progress',
      time: '1 hour ago',
      type: 'update',
    },
    {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      title: 'Payment integration flagged as blocked',
      time: '2 hours ago',
      type: 'alert',
    },
    {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      title: 'Maria Garcia completed "Dashboard analytics widgets"',
      time: '3 hours ago',
      type: 'completion',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg ${activity.bgColor} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm mb-1">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <button className="w-full mt-4 text-sm text-primary hover:underline">
        View all activity →
      </button>
    </div>
  );
}
