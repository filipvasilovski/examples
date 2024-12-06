import { type Request, type Response, type NextFunction } from 'express';

const catchAsync =
  <T extends Request, U extends Response>(
    fn: (req: T, res: U, next?: NextFunction) => Promise<any>
  ) =>
  (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };

export default catchAsync;
