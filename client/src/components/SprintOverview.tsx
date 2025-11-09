import { Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';

export function SprintOverview() {
  const teamMembers = [
    { name: 'Sarah Chen', avatar: 'SC', tasks: 4, completed: 3 },
    { name: 'Alex Kumar', avatar: 'AK', tasks: 5, completed: 3 },
    { name: 'Maria Garcia', avatar: 'MG', tasks: 3, completed: 2 },
    { name: 'James Wilson', avatar: 'JW', tasks: 4, completed: 4 },
    { name: 'Emily Brown', avatar: 'EB', tasks: 2, completed: 1 },
  ];

  const totalTasks = teamMembers.reduce((sum, member) => sum + member.tasks, 0);
  const completedTasks = teamMembers.reduce((sum, member) => sum + member.completed, 0);
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="mb-6">Sprint Overview</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            Sprint Duration
          </div>
          <p>14 days (8 elapsed)</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="w-4 h-4" />
            Team Members
          </div>
          <p>{teamMembers.length} active</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Tasks Completed
          </div>
          <p className="text-green-500">
            {completedTasks} of {totalTasks}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <AlertCircle className="w-4 h-4" />
            Blockers
          </div>
          <p className="text-yellow-500">2 active</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Sprint Progress</span>
          <span className="text-sm">{completionRate}%</span>
        </div>
        <Progress value={completionRate} className="h-3" />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm">Team Members</h4>
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  {member.completed}/{member.tasks} tasks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16">
                <Progress
                  value={(member.completed / member.tasks) * 100}
                  className="h-2"
                />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {Math.round((member.completed / member.tasks) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
