
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Building } from '@entities/catalog/building.entity';
import { Apartment } from '@entities/catalog/apartment.entity';
import { Meter } from '@entities/catalog/meter.entity';
import { UserAssignment } from '@entities/catalog/user-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Building, Apartment, Meter, UserAssignment])],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
