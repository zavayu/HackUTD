import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firebaseUid?: string; // Firebase UID for Firebase auth users
  email: string;
  password?: string; // Optional for Firebase users
  name: string;
  avatar?: string;
  role?: string;
  githubAccessToken?: string;
  authProvider: 'local' | 'firebase'; // Track auth method
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness when present
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: function(this: IUser) {
      // Password only required for local auth
      return this.authProvider === 'local';
    },
    minlength: [8, 'Password must be at least 8 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  avatar: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    default: 'Product Manager',
    trim: true
  },
  githubAccessToken: {
    type: String,
    select: false // Don't include in queries by default for security
  },
  authProvider: {
    type: String,
    enum: ['local', 'firebase'],
    default: 'local',
    required: true
  }
}, {
  timestamps: true
});

// Index for email uniqueness (handled by unique: true above)
// UserSchema.index({ email: 1 }); // THIS IS BAD

// Pre-save hook for password hashing
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new) and exists
  if (!this.isModified('password') || !this.password) return next();

  try {
    // Hash password with cost of 10
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare passwords
UserSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  try {
    // If no password (Firebase user), return false
    if (!(this as any).password) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, (this as any).password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Remove password from JSON output
UserSchema.methods['toJSON'] = function() {
  const userObject = (this as any).toObject();
  delete userObject.password;
  delete userObject.githubAccessToken;
  return userObject;
};

export const User = mongoose.model<IUser>('User', UserSchema);