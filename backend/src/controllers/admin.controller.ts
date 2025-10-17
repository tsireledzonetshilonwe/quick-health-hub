import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin - Users
export const adminGetUsers = async (req: Request, res: Response) => {
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
    console.error('Admin get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminGetUser = async (req: Request, res: Response) => {
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
    console.error('Admin get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminUpdateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { email, fullName, phone, roles } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        fullName,
        phone,
        ...(roles !== undefined ? { roles: Array.isArray(roles) ? roles.join(',') : roles } : {}),
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
    return res.status(200).json(normalized);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Admin update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminSetUserRoles = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const roles = req.body as string[];

    if (!Array.isArray(roles)) {
      return res.status(400).json({ error: 'Roles must be an array' });
    }

    // Enforce that admin users have role exactly 'ADMIN' if includes ADMIN and should not bundle PATIENT
    const finalRolesStr = Array.isArray(roles)
      ? (roles.includes('ADMIN') ? 'ADMIN' : roles.join(','))
      : String(roles || 'PATIENT');

    const user = await prisma.user.update({
      where: { id },
      data: { roles: finalRolesStr },
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
    return res.status(200).json(normalized);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Admin set user roles error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminActivateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const user = await prisma.user.update({
      where: { id },
      data: { active: true },
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
    return res.status(200).json(normalized);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Admin activate user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminDeactivateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const user = await prisma.user.update({
      where: { id },
      data: { active: false },
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
    return res.status(200).json(normalized);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Admin deactivate user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminDeleteUser = async (req: Request, res: Response) => {
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
    console.error('Admin delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin - Appointments
export const adminGetAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });

    const appointmentsWithPatientInfo = appointments.map((appt) => ({
      id: appt.id,
      userId: appt.userId,
      doctor: appt.doctor,
      specialty: appt.specialty,
      appointmentDate: appt.appointmentDate,
      startTime: appt.appointmentDate,
      endTime: appt.endTime,
      reason: appt.reason,
      status: appt.status,
      patientName: appt.user.fullName,
      patientEmail: appt.user.email,
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
    }));

    return res.status(200).json(appointmentsWithPatientInfo);
  } catch (error) {
    console.error('Admin get appointments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminGetAppointment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointmentWithPatientInfo = {
      id: appointment.id,
      userId: appointment.userId,
      doctor: appointment.doctor,
      specialty: appointment.specialty,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.appointmentDate,
      endTime: appointment.endTime,
      reason: appointment.reason,
      status: appointment.status,
      patientName: appointment.user.fullName,
      patientEmail: appointment.user.email,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };

    return res.status(200).json(appointmentWithPatientInfo);
  } catch (error) {
    console.error('Admin get appointment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminUpdateAppointment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { userId, doctor, specialty, appointmentDate, endTime, reason, status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        userId,
        doctor,
        specialty,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        reason,
        status,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    const appointmentWithPatientInfo = {
      id: appointment.id,
      userId: appointment.userId,
      doctor: appointment.doctor,
      specialty: appointment.specialty,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.appointmentDate,
      endTime: appointment.endTime,
      reason: appointment.reason,
      status: appointment.status,
      patientName: appointment.user.fullName,
      patientEmail: appointment.user.email,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };

    return res.status(200).json(appointmentWithPatientInfo);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    console.error('Admin update appointment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminDeleteAppointment = async (req: Request, res: Response) => {
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
    console.error('Admin delete appointment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin - Prescriptions
export const adminGetPrescriptions = async (req: Request, res: Response) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    const prescriptionsWithPatientInfo = prescriptions.map((presc) => ({
      id: presc.id,
      userId: presc.userId,
      medication: presc.medication,
      dosage: presc.dosage,
      instructions: presc.instructions,
      issuedAt: presc.issuedAt,
      expiresAt: presc.expiresAt,
      status: presc.status,
      patientName: presc.user.fullName,
      patientEmail: presc.user.email,
      createdAt: presc.createdAt,
      updatedAt: presc.updatedAt,
    }));

    return res.status(200).json(prescriptionsWithPatientInfo);
  } catch (error) {
    console.error('Admin get prescriptions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminGetPrescription = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    const prescriptionWithPatientInfo = {
      id: prescription.id,
      userId: prescription.userId,
      medication: prescription.medication,
      dosage: prescription.dosage,
      instructions: prescription.instructions,
      issuedAt: prescription.issuedAt,
      expiresAt: prescription.expiresAt,
      status: prescription.status,
      patientName: prescription.user.fullName,
      patientEmail: prescription.user.email,
      createdAt: prescription.createdAt,
      updatedAt: prescription.updatedAt,
    };

    return res.status(200).json(prescriptionWithPatientInfo);
  } catch (error) {
    console.error('Admin get prescription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminUpdatePrescription = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { userId, medication, dosage, instructions, issuedAt, expiresAt, status } = req.body;

    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        userId,
        medication,
        dosage,
        instructions,
        issuedAt: issuedAt ? new Date(issuedAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        status,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    const prescriptionWithPatientInfo = {
      id: prescription.id,
      userId: prescription.userId,
      medication: prescription.medication,
      dosage: prescription.dosage,
      instructions: prescription.instructions,
      issuedAt: prescription.issuedAt,
      expiresAt: prescription.expiresAt,
      status: prescription.status,
      patientName: prescription.user.fullName,
      patientEmail: prescription.user.email,
      createdAt: prescription.createdAt,
      updatedAt: prescription.updatedAt,
    };

    return res.status(200).json(prescriptionWithPatientInfo);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    console.error('Admin update prescription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminDeletePrescription = async (req: Request, res: Response) => {
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
    console.error('Admin delete prescription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin - Contact Messages
export const adminGetContactMessages = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Admin get contact messages error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminGetContactMessage = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) return res.status(404).json({ error: 'Message not found' });
    return res.status(200).json(message);
  } catch (error) {
    console.error('Admin get contact message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminDeleteContactMessage = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.contactMessage.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Message not found' });
    }
    console.error('Admin delete contact message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
