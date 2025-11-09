import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  githubAccessToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
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
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  githubAccessToken: {
    type: String,
    select: false // Don't include in queries by default for security
  }
}, {
  timestamps: true
});

// Index for email uniqueness (handled by unique: true above)
// UserSchema.index({ email: 1 }); // THIS IS BAD

// Pre-save hook for password hashing
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

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
    const password = (this as any).password;
    if (!password) {
      console.error('No password found on user document');
      return false;
    }
    return await bcrypt.compare(candidatePassword, password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
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