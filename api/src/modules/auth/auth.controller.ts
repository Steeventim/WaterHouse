

import { Body, Controller, Post, Get, UseGuards, Request, Param, Patch, Delete, Query } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('users/:id/reset-otp')
  async resetOtp(@Param('id') id: string, @Request() req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.authService.resetOtp(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('users/batch-activate')
  async batchActivate(
    @Body('ids') ids: string[],
    @Request() req: any,
  ) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.batchSetActive(ids, true);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/batch-deactivate')
  async batchDeactivate(
    @Body('ids') ids: string[],
    @Request() req: any,
  ) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.batchSetActive(ids, false);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return { user: req.user };
  }

  @Post('send-otp')
  async sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body.phoneNumber);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.phoneNumber, body.otp, body.requestId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users')
  async createUser(@Body() body: CreateUserDto, @Request() req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/activate')
  async activateUser(@Param('id') id: string, @Request() req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.setActive(id, true);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/deactivate')
  async deactivateUser(@Param('id') id: string, @Request() req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.setActive(id, false);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async listUsers(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('phone') phone?: string,
    @Query('name') name?: string,
  ) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    // Recherche et pagination via service
    return this.usersService.paginateAndFilter({ page: pageNum, limit: limitNum, search, phone, name });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto, @Request() req: any) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.update(id, body);
  }
}
