import { Module } from '@nestjs/common';
import { AppointmentService } from './services/appointment.service';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [CoreModule],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class ApplicationModule {}
