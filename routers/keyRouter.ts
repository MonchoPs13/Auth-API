import { Router } from 'express';
import { generateKey, deleteKey } from '../controllers/keyController';

const router = Router();

router.post('/request', generateKey);
router.delete('/delete', deleteKey);

export default router;
