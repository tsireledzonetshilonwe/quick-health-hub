import { Router } from 'express';
import {
  adminGetUsers,
  adminGetUser,
  adminUpdateUser,
  adminSetUserRoles,
  adminActivateUser,
  adminDeactivateUser,
  adminDeleteUser,
  adminGetAppointments,
  adminGetAppointment,
  adminUpdateAppointment,
  adminDeleteAppointment,
  adminGetPrescriptions,
  adminGetPrescription,
  adminUpdatePrescription,
  adminDeletePrescription,
  adminGetContactMessages,
  adminGetContactMessage,
  adminDeleteContactMessage,
} from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN']));

// Users
router.get('/users', adminGetUsers);
router.get('/users/:id', adminGetUser);
router.put('/users/:id', adminUpdateUser);
router.patch('/users/:id/roles', adminSetUserRoles);
router.patch('/users/:id/activate', adminActivateUser);
router.patch('/users/:id/deactivate', adminDeactivateUser);
router.delete('/users/:id', adminDeleteUser);

// Appointments
router.get('/appointments', adminGetAppointments);
router.get('/appointments/:id', adminGetAppointment);
router.put('/appointments/:id', adminUpdateAppointment);
router.delete('/appointments/:id', adminDeleteAppointment);

// Prescriptions
router.get('/prescriptions', adminGetPrescriptions);
router.get('/prescriptions/:id', adminGetPrescription);
router.put('/prescriptions/:id', adminUpdatePrescription);
router.delete('/prescriptions/:id', adminDeletePrescription);

// Contact Messages
router.get('/contact-messages', adminGetContactMessages);
router.get('/contact-messages/:id', adminGetContactMessage);
router.delete('/contact-messages/:id', adminDeleteContactMessage);

export default router;
