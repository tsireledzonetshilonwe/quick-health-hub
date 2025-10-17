import { Router } from 'express';
import {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from '../controllers/prescription.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getPrescriptions);
router.post('/', createPrescription);
router.get('/:id', getPrescription);
router.put('/:id', updatePrescription);
router.delete('/:id', deletePrescription);

export default router;
