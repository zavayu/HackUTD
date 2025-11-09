import { useState } from 'react';
import { X, UserPlus, User as UserIcon } from 'lucide-react';
import { BacklogItem } from './BacklogCard';
import { ProjectMember } from '../types';

interface AssignMemberModalProps {
  isOpen: boolean;
  story: BacklogItem | null;
  members: ProjectMember[];
  ownerEmail: string;
  onClose: () => void;
  onAssign: (storyId: string, assignee: string) => void;
}

export function AssignMemberModal({ 
  isOpen, 
  story, 
  members, 
  ownerEmail,
  onClose, 
  onAssign 
}: AssignMemberModalProps) {
  const [selectedMember, setSelectedMember] = useState('');

  if (!isOpen || !story) return null;

  const allMembers = [
    { name: 'You (Owner)', email: ownerEmail },
    ...members.map(m => ({ name: m.name, email: m.email }))
  ];

  const handleAssign = () => {
    if (selectedMember) {
      const member = allMembers.find(m => m.email === selectedMember);
      onAssign(story.id, member?.name || selectedMember);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Assign to Member</h2>
            <p className="text-sm text-muted-foreground mt-1">{story.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Select Team Member</label>
            <div className="space-y-2">
              {allMembers.map((member) => (
                <button
                  key={member.email}
                  onClick={() => setSelectedMember(member.email)}
                  className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                    selectedMember === member.email
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  {selectedMember === member.email && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {story.assignee && (
            <button
              onClick={() => {
                onAssign(story.id, '');
                onClose();
              }}
              className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Remove Assignment
            </button>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedMember}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4" />
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
