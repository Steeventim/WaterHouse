import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevController } from './dev.controller';
import { AuthModule } from '../modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { User } from '../modules/auth/entities/user.entity';
import { CommunicationLogsModule } from '../modules/communication/communication-logs.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || join(__dirname, '../../data/sqlite.db'),
      entities: [User],
      synchronize: false, // use migrations for schema changes
      logging: false,
    }),
    AuthModule,
    CommunicationLogsModule,
  ],
  controllers: [AppController, DevController],
  providers: [AppService],
})
export class AppModule {}
