import { Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';

interface SprintOverviewProps {
  activeSprint: any;
  backlogItems: any[];
  members: any[];
  ownerEmail: string;
}

export function SprintOverview({ activeSprint, backlogItems, members, ownerEmail }: SprintOverviewProps) {
  if (!activeSprint) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="mb-6">Sprint Overview</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No active sprint</p>
          <p className="text-sm text-muted-foreground mt-2">Start a sprint to see overview</p>
        </div>
      </div>
    );
  }

  // Calculate sprint duration
  const startDate = new Date(activeSprint.actualStartDate || activeSprint.startDate);
  const endDate = new Date(activeSprint.endDate);
  const today = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Get sprint items
  const sprintItems = backlogItems.filter(item => item.sprintId === activeSprint._id);
  const totalTasks = sprintItems.length;
  const completedTasks = sprintItems.filter(item => item.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate member stats
  const allMembers = [
    { name: 'You (Owner)', email: ownerEmail },
    ...members.map(m => ({ name: m.name, email: m.email }))
  ];

  const memberStats = allMembers.map(member => {
    const memberTasks = sprintItems.filter(item => item.assignee === member.name || item.assignee === member.email);
    const memberCompleted = memberTasks.filter(item => item.status === 'done');
    return {
      name: member.name,
      avatar: member.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      tasks: memberTasks.length,
      completed: memberCompleted.length,
    };
  }).filter(m => m.tasks > 0); // Only show members with tasks

  // Count blockers (in_progress items that haven't moved in a while - simplified to just in_progress)
  const blockers = sprintItems.filter(item => item.status === 'in_progress').length;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="mb-6">Sprint Overview</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            Sprint Duration
          </div>
          <p>{totalDays} days ({Math.min(elapsedDays, totalDays)} elapsed)</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="w-4 h-4" />
            Team Members
          </div>
          <p>{memberStats.length} active</p>
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
            In Progress
          </div>
          <p className={blockers > 0 ? "text-yellow-500" : "text-muted-foreground"}>{blockers} items</p>
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
        {memberStats.length > 0 ? (
          memberStats.map((member, index) => (
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
                    value={member.tasks > 0 ? (member.completed / member.tasks) * 100 : 0}
                    className="h-2"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {member.tasks > 0 ? Math.round((member.completed / member.tasks) * 100) : 0}%
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks assigned yet</p>
        )}
      </div>
    </div>
  );
}
