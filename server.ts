import express from 'express';
import { createServer } from 'http';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';

import router from '@/routes';

import errorHandler from '@/middleware/errorHandlers';

import corsOptions from '@/config/corsOptions';
import sanitizedConfig from '@/config/config';

import initializeSocket from '@/lib/socketManager';

import { type RoomUserState } from '@/@types/socket';

const app = express();
const httpServer = createServer(app);

const roomUserState: RoomUserState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
app.use(compression());

app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));

export const io = initializeSocket(httpServer, roomUserState);

app.use('/api/v1', router);

app.use(errorHandler);

httpServer.listen(sanitizedConfig.PORT, () => {
  console.log(`Server running on port ${sanitizedConfig.PORT}`);
});
