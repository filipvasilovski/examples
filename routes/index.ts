import express from 'express';
import roomsRouter from '@/routes/roomsRouter';

const router = express.Router();

router.use('/rooms', roomsRouter);

export default router;
