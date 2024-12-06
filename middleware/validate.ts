import { type Request, type Response, type NextFunction } from 'express';
import { type Schema } from 'zod';

const validate =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (err: any) {
      return res.status(400).json(err.errors);
    }
  };

export default validate;
