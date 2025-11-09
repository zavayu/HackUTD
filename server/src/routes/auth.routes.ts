import { Router, Request, Response } from 'express';
import { User } from '../models/User';

const router = Router();

// Create or update user from Firebase signup
router.post('/firebase-signup', async (req: Request, res: Response) => {
  try {
    const { firebaseUid, email, name, avatar } = req.body;

    // Validate required fields
    if (!firebaseUid || !email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firebaseUid, email, and name are required'
      });
    }

    // Check if user already exists by Firebase UID
    let user = await User.findOne({ firebaseUid });

    if (user) {
      // User exists, update their info
      user.email = email;
      user.name = name;
      if (avatar) user.avatar = avatar;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: user.toJSON()
      });
    }

    // Check if email is already used by another user
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered with a different account'
      });
    }

    // Create new user
    user = new User({
      firebaseUid,
      email,
      name,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUid}`,
      authProvider: 'firebase',
      role: 'Product Manager'
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: user.toJSON()
    });

  } catch (error: any) {
    console.error('Firebase signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create/update user',
      error: error.message
    });
  }
});

// Get user by Firebase UID
router.get('/firebase-user/:firebaseUid', async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON()
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Update user profile
router.put('/user/:firebaseUid', async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;
    const { name, avatar, role } = req.body;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (role) user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: user.toJSON()
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

export default router;
