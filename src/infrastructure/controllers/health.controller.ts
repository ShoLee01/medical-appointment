import { Controller, Get, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidationPipe } from 'src/shared/middleware/validation.pipe';

@Controller()
@ApiTags('Health')
@UsePipes(ValidationPipe)
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Check service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      awsRegion: process.env.AWS_REGION || 'local',
    };
  }
}
