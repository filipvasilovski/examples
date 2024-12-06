import express from 'express';

import {
  getAllRooms,
  getRoom,
  getAvailableRooms,
} from '@/controllers/roomsController';
import { getRoomSchema } from '@/validations/roomsValidation';

import validate from '@/middleware/validate';

const roomsRouter = express.Router();

roomsRouter.route('/').get(getAllRooms);

roomsRouter.route('/available').get(getAvailableRooms);
roomsRouter.route('/:id').get(validate(getRoomSchema), getRoom);

export default roomsRouter;
