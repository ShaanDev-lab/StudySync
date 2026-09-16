import { Router } from 'express';
import { getSubjects, createSubject, deleteSubject } from '../controllers/subjectController.js';

const router = Router();

router.get('/', getSubjects);
router.post('/', createSubject);
router.delete('/:id', deleteSubject);

export default router;
