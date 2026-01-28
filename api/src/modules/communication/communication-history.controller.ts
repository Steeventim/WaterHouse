import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommunicationLogsService } from './communication-logs.service';

@UseGuards(JwtAuthGuard)
@Controller('communication')
export class CommunicationHistoryController {
  constructor(private readonly logsService: CommunicationLogsService) {}

  @Get('my-history')
  async getMyHistory(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!req.user) throw new Error('Auth required');
    // Seul le gestionnaire peut voir son historique
    if (req.user.role !== 'manager' && req.user.role !== 'gestionnaire') throw new Error('Manager only');
    return this.logsService.findAll({
      userId: req.user.id,
      type,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }
}
