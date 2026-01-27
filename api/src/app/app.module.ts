import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevController } from './dev.controller';
import { AuthModule } from '../modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UserEntity } from '../modules/auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || join(__dirname, '../../data/sqlite.db'),
      entities: [UserEntity],
      synchronize: false, // use migrations for schema changes
      logging: false,
    }),
    AuthModule,
  ],
  controllers: [AppController, DevController],
  providers: [AppService],
})
export class AppModule {}
