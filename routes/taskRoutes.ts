import express from 'express';
import { 
  getAllTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  getClashes 
} from '../controllers/taskController.js';

const router = express.Router();

router.get('/', getAllTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/detect-clashes', getClashes);

export default router;
