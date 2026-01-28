import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationLog } from './communication-log.entity';
import { CommunicationLogsService } from './communication-logs.service';
import { CommunicationLogsController } from './communication-logs.controller';
import { CommunicationMetric } from './communication-metrics.entity';
import { CommunicationMetricsService } from './communication-metrics.service';
import { CommunicationMetricsController } from './communication-metrics.controller';
import { CommunicationHistoryController } from './communication-history.controller';
import { CommunicationLogsArchiverService } from './communication-logs-archiver.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommunicationLog, CommunicationMetric])],
  providers: [CommunicationLogsService, CommunicationMetricsService, CommunicationLogsArchiverService],
  controllers: [CommunicationLogsController, CommunicationMetricsController, CommunicationHistoryController],
})
export class CommunicationLogsModule {}
