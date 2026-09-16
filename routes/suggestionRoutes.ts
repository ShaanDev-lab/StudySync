import express from 'express';
import { 
  getPendingSuggestions,
  acceptSuggestion,
  rejectSuggestion
} from '../controllers/suggestionController.js';

const router = express.Router();

router.get('/', getPendingSuggestions);
router.post('/:id/accept', acceptSuggestion);
router.post('/:id/reject', rejectSuggestion);

export default router;
