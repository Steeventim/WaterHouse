import { Controller, Post } from '@nestjs/common';
import { UsersService } from '../modules/auth/users.service';

@Controller('dev')
export class DevController {
  constructor(private readonly usersService: UsersService) {}

  @Post('seed-admin')
  async seedAdmin() {
    const existing = await this.usersService.findByUsername('admin');
    if (existing) {
      return { ok: true, existing: true, id: (existing as any).id };
    }
    const created = await this.usersService.create({ username: 'admin', password: 'password', role: 'admin' });
    return { ok: true, created: { id: (created as any).id, username: (created as any).username } };
  }
}
