import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

// Nested document interfaces
export interface ICommit {
  sha: string;
  message: string;
  author: string;
  date: Date;
  embeddingId?: string;
}

export interface IPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  createdAt: Date;
  mergedAt?: Date;
  embeddingId?: string;
}

export interface IGitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: string;
  createdAt: Date;
  closedAt?: Date;
  embeddingId?: string;
}

export interface IGitHubRepo extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  accessToken: string;
  isActive: boolean;
  lastSyncTime?: Date;
  syncStatus: 'pending' | 'syncing' | 'success' | 'failed';
  syncError?: string;
  commits: ICommit[];
  pullRequests: IPullRequest[];
  issues: IGitHubIssue[];
  createdAt: Date;
  updatedAt: Date;
  encryptAccessToken(token: string): string;
  decryptAccessToken(): string;
}

// Nested schemas
const CommitSchema = new Schema<ICommit>({
  sha: {
    type: String,
    required: true,
    unique: true
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Commit message cannot exceed 1000 characters']
  },
  author: {
    type: String,
    required: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: true
  },
  embeddingId: {
    type: String,
    trim: true
  }
}, { _id: false });

const PullRequestSchema = new Schema<IPullRequest>({
  number: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'PR title cannot exceed 200 characters']
  },
  state: {
    type: String,
    enum: {
      values: ['open', 'closed', 'merged'],
      message: 'PR state must be open, closed, or merged'
    },
    required: true
  },
  author: {
    type: String,
    required: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  createdAt: {
    type: Date,
    required: true
  },
  mergedAt: {
    type: Date
  },
  embeddingId: {
    type: String,
    trim: true
  }
}, { _id: false });

const GitHubIssueSchema = new Schema<IGitHubIssue>({
  number: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Issue title cannot exceed 200 characters']
  },
  state: {
    type: String,
    enum: {
      values: ['open', 'closed'],
      message: 'Issue state must be open or closed'
    },
    required: true
  },
  author: {
    type: String,
    required: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  createdAt: {
    type: Date,
    required: true
  },
  closedAt: {
    type: Date
  },
  embeddingId: {
    type: String,
    trim: true
  }
}, { _id: false });

// Main GitHubRepo schema
const GitHubRepoSchema = new Schema<IGitHubRepo>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Repository full name is required'],
    unique: true,
    trim: true,
    maxlength: [200, 'Repository full name cannot exceed 200 characters'],
    validate: {
      validator: function(fullName: string) {
        return /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(fullName);
      },
      message: 'Repository full name must be in format "owner/repo"'
    }
  },
  accessToken: {
    type: String,
    required: [true, 'Access token is required'],
    select: false // Don't include in queries by default for security
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastSyncTime: {
    type: Date
  },
  syncStatus: {
    type: String,
    enum: {
      values: ['pending', 'syncing', 'success', 'failed'],
      message: 'Sync status must be pending, syncing, success, or failed'
    },
    default: 'pending'
  },
  syncError: {
    type: String,
    maxlength: [500, 'Sync error message cannot exceed 500 characters']
  },
  commits: [CommitSchema],
  pullRequests: [PullRequestSchema],
  issues: [GitHubIssueSchema]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
GitHubRepoSchema.index({ userId: 1, isActive: 1 });

// Encryption key from environment variable
const ENCRYPTION_KEY = process.env['ENCRYPTION_KEY'] || 'default-key-for-development-only-change-in-production';

// Method to encrypt access token
GitHubRepoSchema.methods['encryptAccessToken'] = function(token: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Method to decrypt access token
GitHubRepoSchema.methods['decryptAccessToken'] = function(): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update((this as any).accessToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Pre-save hook to encrypt access token
GitHubRepoSchema.pre('save', function(next) {
  if (this.isModified('accessToken') && !(this as any).accessToken.startsWith('encrypted:')) {
    (this as any).accessToken = 'encrypted:' + (this as any).encryptAccessToken((this as any).accessToken);
  }
  next();
});

// Override toJSON to exclude sensitive data
GitHubRepoSchema.methods['toJSON'] = function() {
  const repoObject = (this as any).toObject();
  delete repoObject.accessToken;
  return repoObject;
};

export const GitHubRepo = mongoose.model<IGitHubRepo>('GitHubRepo', GitHubRepoSchema);