import { Controller, Post } from '@nestjs/common';
import { UsersService } from '../modules/auth/users.service';

@Controller('dev')
export class DevController {
  constructor(private readonly usersService: UsersService) {}

  @Post('seed-admin')
  async seedAdmin() {
    const phoneNumber = '+225000000000';
    const existing = await this.usersService.findByPhoneNumber(phoneNumber);
    if (existing) {
      return { ok: true, existing: true, id: (existing as any).id };
    }
    const created = await this.usersService.create({ id: 'admin', phoneNumber, role: 'admin', name: 'Admin', isActive: true });
    return { ok: true, created: { id: (created as any).id, phoneNumber: (created as any).phoneNumber } };
  }
}
