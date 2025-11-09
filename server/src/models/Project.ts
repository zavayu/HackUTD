import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  status: 'active' | 'archived';
  deadline?: Date;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'member';
    addedAt: Date;
  }>;
  connectedRepos: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Project description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'archived'],
      message: 'Status must be either active or archived'
    },
    default: 'active'
  },
  deadline: {
    type: Date,
    required: false
  },
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  connectedRepos: [{
    type: Schema.Types.ObjectId,
    ref: 'GitHubRepo'
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries by user and status
ProjectSchema.index({ userId: 1, status: 1 });

// Pre-remove middleware to cascade delete associated issues and sprints
ProjectSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const projectId = this._id;
    
    // Import models here to avoid circular dependencies
    const Issue = mongoose.model('Issue');
    const Sprint = mongoose.model('Sprint');
    
    // Delete all issues associated with this project
    await Issue.deleteMany({ projectId });
    
    // Delete all sprints associated with this project
    await Sprint.deleteMany({ projectId });
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Also handle findOneAndDelete
ProjectSchema.pre('findOneAndDelete', async function(next) {
  try {
    const project = await this.model.findOne(this.getQuery());
    if (project) {
      // Import models here to avoid circular dependencies
      const Issue = mongoose.model('Issue');
      const Sprint = mongoose.model('Sprint');
      
      // Delete all issues associated with this project
      await Issue.deleteMany({ projectId: project._id });
      
      // Delete all sprints associated with this project
      await Sprint.deleteMany({ projectId: project._id });
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);