import { User, IUser } from '../models/User';
import { AppError } from '../utils/errors';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  githubAccessToken?: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  name?: string;
  githubAccessToken?: string;
}

export class UserRepository {
  /**
   * Create a new user
   */
  async create(data: CreateUserData): Promise<IUser> {
    try {
      const user = new User(data);
      return await user.save();
    } catch (error: any) {
      // Handle duplicate email constraint
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new AppError(400, 'DUPLICATE_EMAIL', 'Email address is already registered');
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', 'User validation failed', messages);
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to create user');
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id).select('+githubAccessToken');
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find user by ID');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() }).select('+password +githubAccessToken');
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find user by email');
    }
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: UpdateUserData): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { $set: data },
        { 
          new: true, 
          runValidators: true 
        }
      ).select('+githubAccessToken');

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      return user;
    } catch (error: any) {
      // Handle duplicate email constraint
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new AppError(400, 'DUPLICATE_EMAIL', 'Email address is already registered');
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', 'User validation failed', messages);
      }

      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to update user');
    }
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await User.findByIdAndDelete(id);
      
      if (!result) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }
    } catch (error: any) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to delete user');
    }
  }
}