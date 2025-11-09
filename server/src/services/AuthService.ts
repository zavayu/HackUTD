import { UserRepository } from '../repositories/UserRepository';
import { JWTUtils } from '../utils/jwt';
import { AppError, ValidationError, AuthenticationError } from '../utils/errors';
import { IUser } from '../models/User';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: IUser;
  token: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user with password hashing and user creation
   * @param data - Registration data containing email, password, and name
   * @returns Promise<IUser> - The created user
   * @throws ValidationError for invalid email format or validation failures
   * @throws AppError for duplicate email or database errors
   */
  async register(data: RegisterData): Promise<IUser> {
    const { email, password, name } = data;

    // Email format validation (additional validation beyond model)
    if (!this.isValidEmail(email)) {
      throw new ValidationError('Please provide a valid email address');
    }

    // Password validation
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Name validation
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    try {
      // Create user (password will be hashed by the User model pre-save hook)
      const user = await this.userRepository.create({
        email: email.toLowerCase().trim(),
        password,
        name: name.trim()
      });

      return user;
    } catch (error) {
      // Re-throw AppError instances (including duplicate email errors)
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'REGISTRATION_FAILED', 'Failed to register user');
    }
  }

  /**
   * Login user with password verification and JWT generation
   * @param data - Login data containing email and password
   * @returns Promise<AuthResult> - User and JWT token
   * @throws AuthenticationError for invalid credentials
   * @throws AppError for database errors
   */
  async login(data: LoginData): Promise<AuthResult> {
    const { email, password } = data;

    // Input validation
    if (!email || !password) {
      throw new AuthenticationError('Email and password are required');
    }

    try {
      // Find user by email (includes password field for comparison)
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Verify password using the model's comparePassword method
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate JWT token
      const token = JWTUtils.generateToken((user._id as string).toString());

      return {
        user,
        token
      };
    } catch (error) {
      // Re-throw AuthenticationError instances
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      // Re-throw other AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'LOGIN_FAILED', 'Failed to login user');
    }
  }

  /**
   * Validate email format
   * @param email - Email address to validate
   * @returns boolean - True if email format is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}