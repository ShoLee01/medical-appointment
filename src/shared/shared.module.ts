import { Global, Module } from '@nestjs/common';
import { AppLogger } from './utils/logger.util';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class SharedModule {}
