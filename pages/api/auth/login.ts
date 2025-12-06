/**
 * Login API Route
 * Authenticates user with MongoDB and returns JWT token
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import type { AuthResponse } from '@/lib/types/auth';
import { createSessionCookie, authenticateUser, generateToken } from '@/lib/auth';
import { LoginSchema } from '@/lib/validators/auth';
import { isDemo } from '@/lib/isDemo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Demo mode - return mock user based on email
    if (isDemo()) {
      const { email } = req.body;
      let role: 'contributor' | 'company' | 'verifier' = 'contributor';

      // Determine role from email for demo purposes
      if (email?.includes('verifier')) role = 'verifier';
      else if (email?.includes('company')) role = 'company';

      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email: email || 'demo@airswap.io',
        role,
        full_name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      };

      const token = generateToken(mockUser);
      const sessionCookie = createSessionCookie({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        full_name: mockUser.full_name,
        access_token: token,
      });

      res.setHeader('Set-Cookie', sessionCookie);

      return res.status(200).json({
        success: true,
        user: mockUser,
        access_token: token,
        message: 'Demo login successful',
      });
    }

    // Validate request body
    const validatedData = LoginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Authenticate user with MongoDB
    const user = await authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    // Set session cookie
    const sessionCookie = createSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      access_token: token,
    });

    res.setHeader('Set-Cookie', sessionCookie);

    // Return success response
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      access_token: token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

