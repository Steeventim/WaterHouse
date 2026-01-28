import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app/app.module';
import { CommunicationLogsArchiverService } from '../communication/communication-logs-archiver.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const archiver = app.get(CommunicationLogsArchiverService);
  const count = await archiver.archiveOldLogs();
  // eslint-disable-next-line no-console
  console.log(`Archived ${count} old communication logs.`);
  await app.close();
}

bootstrap();
