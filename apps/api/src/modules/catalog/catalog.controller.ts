import { Controller, Get, Query, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('api/v1/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}
  // --- CRUD Compteurs (Meters) ---

  @Get('meters')
  async getMeters(@Query() query: any) {
    // TODO: pagination/filtrage
    return this.catalogService.findAllMeters(query);
  }

  @Get('meters/:id')
  async getMeter(@Param('id') id: string) {
    return this.catalogService.findMeterById(id);
  }

  @Post('meters')
  async createMeter(@Body() dto: any) {
    return this.catalogService.createMeter(dto);
  }

  @Put('meters/:id')
  async updateMeter(@Param('id') id: string, @Body() dto: any) {
    return this.catalogService.updateMeter(id, dto);
  }

  @Delete('meters/:id')
  async deleteMeter(@Param('id') id: string) {
    return this.catalogService.deleteMeter(id);
  }

  @Get('sync')
  async sync(@Query() query: { lastSync?: string; userId?: string }) {
    return this.catalogService.syncCatalog({
      lastSync: query.lastSync,
      userId: query.userId,
    });
  }

  @Get('user-assignments')
  async userAssignments(@Query('userId') userId?: string): Promise<{ userId: string; assignedBuildings: string[]; assignedApartments: string[]; lastAssignmentUpdate: string; }> {
    return this.catalogService.getUserAssignments(userId);
  }

  @Post('user-assignments')
  async createUserAssignments(@Body() dto: { userId: string; buildingIds?: string[]; apartmentIds?: string[]; assignedBy?: string }) {
    return this.catalogService.createUserAssignments(dto);
  }

  @Delete('user-assignments')
  async deleteUserAssignments(@Body() dto: { userId: string; buildingIds?: string[]; apartmentIds?: string[] }) {
    return this.catalogService.deleteUserAssignments(dto);
  }
}
