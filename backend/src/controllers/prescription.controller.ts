import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPrescriptions = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
    });

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPrescription = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    return res.status(200).json(prescription);
  } catch (error) {
    console.error('Get prescription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPrescription = async (req: Request, res: Response) => {
  try {
    const { userId, medication, dosage, instructions, issuedAt, issuedDate, expiresAt, status } = req.body;

    if (!userId || !medication || !dosage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        userId,
        medication,
        dosage,
        instructions: instructions || null,
        issuedAt: (issuedAt || issuedDate) ? new Date(issuedAt || issuedDate) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: status || 'Active',
      },
    });

    return res.status(201).json(prescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePrescription = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { userId, medication, dosage, instructions, issuedAt, issuedDate, expiresAt, status } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        userId,
        medication,
        dosage,
        instructions,
        issuedAt: (issuedAt || issuedDate) ? new Date(issuedAt || issuedDate) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        status,
      },
    });

    return res.status(200).json(prescription);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    console.error('Update prescription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePrescription = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.prescription.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    console.error('Delete prescription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
