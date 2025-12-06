/**
 * Logout API Route
 * Clears user session and cookies
 * JWT-based auth - simply clear the cookie (stateless)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { AuthResponse } from '@/lib/types/auth';
import { createLogoutCookie } from '@/lib/auth';

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
    // Clear session cookie (JWT is stateless, so we just clear the cookie)
    res.setHeader('Set-Cookie', createLogoutCookie());

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);

    // Even if there's an error, clear the cookie
    res.setHeader('Set-Cookie', createLogoutCookie());

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

