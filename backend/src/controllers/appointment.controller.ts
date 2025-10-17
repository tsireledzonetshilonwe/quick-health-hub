import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { appointmentDate: 'desc' },
    });

    // Map DB field appointmentDate -> API field startTime
    const mapped = appointments.map((a) => ({
      id: a.id,
      userId: a.userId,
      doctor: a.doctor,
      specialty: a.specialty,
      startTime: a.appointmentDate,
      endTime: a.endTime,
      reason: a.reason,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return res.status(200).json(mapped);
  } catch (error) {
    console.error('Get appointments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAppointment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const mapped = appointment && {
      id: appointment.id,
      userId: appointment.userId,
      doctor: appointment.doctor,
      specialty: appointment.specialty,
      startTime: appointment.appointmentDate,
      endTime: appointment.endTime,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };

    return res.status(200).json(mapped);
  } catch (error) {
    console.error('Get appointment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    // Accept both startTime and appointmentDate from client
    const { userId, doctor, specialty, startTime, appointmentDate, endTime, reason, status } = req.body;

    const when = startTime || appointmentDate;

    if (!userId || !doctor || !specialty || !when) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        doctor,
        specialty,
        appointmentDate: new Date(when),
        endTime: endTime ? new Date(endTime) : null,
        reason: reason || null,
        status: status || 'PENDING',
      },
    });

    // Return API shape with startTime
    const mapped = {
      id: appointment.id,
      userId: appointment.userId,
      doctor: appointment.doctor,
      specialty: appointment.specialty,
      startTime: appointment.appointmentDate,
      endTime: appointment.endTime,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };

    return res.status(201).json(mapped);
  } catch (error) {
    console.error('Create appointment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { userId, doctor, specialty, startTime, appointmentDate, endTime, reason, status } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        userId,
        doctor,
        specialty,
        appointmentDate: (startTime || appointmentDate) ? new Date(startTime || appointmentDate) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        reason,
        status,
      },
    });

    const mapped = {
      id: appointment.id,
      userId: appointment.userId,
      doctor: appointment.doctor,
      specialty: appointment.specialty,
      startTime: appointment.appointmentDate,
      endTime: appointment.endTime,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };

    return res.status(200).json(mapped);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    console.error('Update appointment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.appointment.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    console.error('Delete appointment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
