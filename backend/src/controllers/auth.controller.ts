import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: fullName || '',
        phone: phone || null,
        roles: 'PATIENT',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        roles: true,
        avatar: true,
      },
    });

    // Normalize roles to array for frontend
    const normalized = {
      ...user,
      roles: (user.roles || 'PATIENT').split(',').map(r => r.trim()).filter(Boolean),
    } as any;
    return res.status(201).json(normalized);
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.email = user.email;
  req.session.roles = (user.roles || 'PATIENT').split(',').map(r => r.trim()).filter(Boolean);

    const { password: _, ...userWithoutPassword } = user as any;
    const responseUser = {
      ...userWithoutPassword,
      roles: (user.roles || 'PATIENT').split(',').map(r => r.trim()).filter(Boolean),
    } as any;

    return res.status(200).json({
      user: responseUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};
