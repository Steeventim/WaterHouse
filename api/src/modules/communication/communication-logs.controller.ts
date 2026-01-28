import { Controller, Get, Query, UseGuards, Request, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommunicationLogsService } from './communication-logs.service';
import { Response } from 'express';
import { CommunicationMetricsService } from './communication-metrics.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/communication-logs')
export class CommunicationLogsController {
  constructor(
    private readonly logsService: CommunicationLogsService,
    private readonly metricsService: CommunicationMetricsService,
  ) {}

  @Get()
  async getLogs(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    if (req.user?.role !== 'admin') throw new Error('Admin only');
    return this.logsService.findAll({
      type,
      status,
      userId,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('export')
  async exportLogs(
    @Request() req: any,
    @Res() res: Response,
    @Query('format') format: string = 'csv',
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (req.user?.role !== 'admin') throw new Error('Admin only');
    if (format === 'csv') {
      const result = await this.logsService.export({ format, type, status, userId, startDate, endDate });
      const csv = (result as { csv: string }).csv;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="communication-logs.csv"');
      return res.send(csv);
    } else {
      const logs = await this.logsService.export({ format, type, status, userId, startDate, endDate });
      return res.json(logs);
    }
  }

  @Get(':id')
  async getLogById(@Request() req: any, @Query('id') id: string) {
    if (req.user?.role !== 'admin') throw new Error('Admin only');
    return this.logsService.findById(id);
  }

  @Get('/../communication-metrics')
  async getMetrics(
    @Request() req: any,
    @Query('period') period?: string,
    @Query('type') type?: string,
  ) {
    if (req.user?.role !== 'admin') throw new Error('Admin only');
    return this.metricsService.findAll({ period, type });
  }
}
