import { useState } from 'react';
import { X, UserPlus, Mail, Trash2, Crown, Shield, User as UserIcon } from 'lucide-react';
import { ProjectMember } from '../types';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ProjectMember[];
  ownerEmail: string;
  onAddMember: (email: string, role: 'admin' | 'member') => void;
  onRemoveMember: (email: string) => void;
}

export function TeamMembersModal({
  isOpen,
  onClose,
  members,
  ownerEmail,
  onAddMember,
  onRemoveMember,
}: TeamMembersModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onAddMember(email, role);
      setEmail('');
      setRole('member');
    }
  };

  const getRoleIcon = (memberRole: string) => {
    if (memberRole === 'owner') return <Crown className="w-4 h-4 text-yellow-500" />;
    if (memberRole === 'admin') return <Shield className="w-4 h-4 text-blue-500" />;
    return <UserIcon className="w-4 h-4 text-gray-500" />;
  };

  const allMembers = [
    {
      email: ownerEmail,
      name: 'You',
      role: 'owner' as const,
      addedAt: new Date().toISOString(),
    },
    ...members,
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="mb-1">Team Members</h2>
            <p className="text-sm text-muted-foreground">
              Manage who has access to this project
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Member Form */}
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-accent/30 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-medium">Add Team Member</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Enter the email of a registered user to add them to this project
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
                >
                  Add Member
                </button>
              </div>
            </div>
          </form>

          {/* Members List */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              Current Members ({allMembers.length})
            </h3>
            <div className="space-y-2">
              {allMembers.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between p-3 bg-accent/20 rounded-lg hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{member.name}</p>
                        {getRoleIcon(member.role)}
                        <span className="text-xs text-muted-foreground capitalize">
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => onRemoveMember(member.email)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
