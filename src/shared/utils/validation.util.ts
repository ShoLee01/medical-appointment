import { ValidationError, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class ValidationUtil {
  static async validateDTO<T extends object>(
    dtoClass: new () => T,
    data: object,
  ): Promise<ValidationError[]> {
    const dto = plainToInstance(dtoClass, data);
    return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  }
}
