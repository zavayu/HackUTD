import mongoose, { Document, Schema } from 'mongoose';

export interface IIssue extends Document {
  projectId: mongoose.Types.ObjectId;
  sprintId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'story' | 'task' | 'bug';
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  priorityScore?: number;
  assignee?: string;
  estimatedHours?: number;
  acceptanceCriteria: string[];
  embeddingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
    index: true
  },
  sprintId: {
    type: Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Issue title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Issue description cannot exceed 5000 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['story', 'task', 'bug'],
      message: 'Type must be story, task, or bug'
    },
    required: [true, 'Issue type is required']
  },
  status: {
    type: String,
    enum: {
      values: ['backlog', 'todo', 'in_progress', 'done'],
      message: 'Status must be backlog, todo, in_progress, or done'
    },
    default: 'backlog'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be low, medium, high, or critical'
    },
    default: 'medium'
  },
  priorityScore: {
    type: Number,
    min: [1, 'Priority score must be between 1 and 100'],
    max: [100, 'Priority score must be between 1 and 100']
  },
  assignee: {
    type: String,
    trim: true,
    maxlength: [100, 'Assignee name cannot exceed 100 characters']
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  acceptanceCriteria: [{
    type: String,
    trim: true,
    maxlength: [500, 'Each acceptance criterion cannot exceed 500 characters']
  }],
  embeddingId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
IssueSchema.index({ projectId: 1, status: 1 });
IssueSchema.index({ projectId: 1, priority: 1 });
IssueSchema.index({ sprintId: 1 });

// Validation to ensure sprint belongs to the same project
IssueSchema.pre('save', async function(next) {
  if (this.sprintId && this.isModified('sprintId')) {
    try {
      const Sprint = mongoose.model('Sprint');
      const sprint = await Sprint.findById(this.sprintId);
      
      if (!sprint) {
        return next(new Error('Sprint not found'));
      }
      
      if (!sprint.projectId.equals(this.projectId)) {
        return next(new Error('Sprint must belong to the same project as the issue'));
      }
      
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// Validation for sprint-project relationship on update
IssueSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  
  if (update.sprintId || update.$set?.sprintId) {
    try {
      const sprintId = update.sprintId || update.$set?.sprintId;
      const issue = await this.model.findOne(this.getQuery());
      
      if (!issue) {
        return next(new Error('Issue not found'));
      }
      
      const Sprint = mongoose.model('Sprint');
      const sprint = await Sprint.findById(sprintId);
      
      if (!sprint) {
        return next(new Error('Sprint not found'));
      }
      
      if (!sprint.projectId.equals(issue.projectId)) {
        return next(new Error('Sprint must belong to the same project as the issue'));
      }
      
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);