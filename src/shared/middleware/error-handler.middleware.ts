import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../utils/logger.util';

@Injectable()
export class ErrorHandlerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        this.logger.error(
          `Error ${res.statusCode} on ${req.method} ${req.path}`,
          '',
          'HTTP',
        );
      }
    });
    next();
  }
}
