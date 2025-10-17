import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        roles: true,
        active: true,
        avatar: true,
        createdAt: true,
      },
    });
    const normalized = users.map((u) => ({
      ...u,
      roles: (u.roles || 'PATIENT')
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    }));
    return res.status(200).json(normalized);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        roles: true,
        active: true,
        gender: true,
        dateOfBirth: true,
        address: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const normalized = user && {
      ...user,
      roles: (user.roles || 'PATIENT')
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    };
    return res.status(200).json(normalized);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
  const { email, password, fullName, phone, roles } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: fullName || '',
        phone: phone || null,
        roles: Array.isArray(roles) ? roles.join(',') : (roles || 'PATIENT'),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        roles: true,
        active: true,
        avatar: true,
      },
    });
    const normalized = {
      ...user,
      roles: (user.roles || 'PATIENT')
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    };
    return res.status(201).json(normalized);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'User already exists' });
    }
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
  const { email, fullName, phone, roles, gender, dateOfBirth, address, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        fullName,
        phone,
        roles: Array.isArray(roles) ? roles.join(',') : roles,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        address,
        avatar,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        roles: true,
        active: true,
        gender: true,
        dateOfBirth: true,
        address: true,
        avatar: true,
      },
    });
    const normalized = {
      ...user,
      roles: (user.roles || 'PATIENT')
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    };
    return res.status(200).json(normalized);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.user.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        roles: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const normalized = user && {
      ...user,
      roles: (user.roles || 'PATIENT')
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    };
    return res.status(200).json(normalized);
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const { email, fullName, phone } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        fullName,
        phone,
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
    const normalized = {
      ...user,
      roles: (user.roles || 'PATIENT')
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    };
    return res.status(200).json(normalized);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Update me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
