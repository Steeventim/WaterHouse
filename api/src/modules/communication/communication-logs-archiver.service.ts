import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CommunicationLog } from './communication-log.entity';

@Injectable()
export class CommunicationLogsArchiverService {
  private readonly logger = new Logger(CommunicationLogsArchiverService.name);

  constructor(
    @InjectRepository(CommunicationLog)
    private readonly logRepo: Repository<CommunicationLog>,
  ) {}

  /**
   * Archive (soft-delete) logs older than the given date (default: 1 an)
   */
  async archiveOldLogs(beforeDate?: Date): Promise<number> {
    const cutoff = beforeDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    // Ajoute un champ isArchived si besoin, sinon suppression physique
    const result = await this.logRepo.delete({ createdAt: LessThan(cutoff) });
    this.logger.log(`Archived ${result.affected} communication logs older than ${cutoff.toISOString()}`);
    return result.affected || 0;
  }
}
