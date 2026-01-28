import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommunicationMetricsService } from './communication-metrics.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/communication-metrics')
export class CommunicationMetricsController {
  constructor(private readonly metricsService: CommunicationMetricsService) {}

  @Get()
  async getMetrics(
    @Request() req: any,
    @Query('period') period?: string,
    @Query('type') type?: string,
  ) {
    if (req.user?.role !== 'admin') throw new Error('Admin only');
    return this.metricsService.findAll({ period, type });
  }
}
