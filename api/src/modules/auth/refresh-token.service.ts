import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';

const REFRESH_TOKEN_EXP_MINUTES = 15;

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly tokenRepo: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async issue(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXP_MINUTES * 60 * 1000);
    const refresh = this.tokenRepo.create({ user, token, expiresAt, lastUsedAt: now, revoked: false });
    await this.tokenRepo.save(refresh);
    return { refreshToken: token, expiresAt };
  }

  async verify(userId: string, token: string) {
    const refresh = await this.tokenRepo.findOne({ where: { user: { id: userId }, token }, relations: ['user'] });
    if (!refresh || refresh.revoked) throw new ForbiddenException('Refresh token invalid');
    if (refresh.expiresAt < new Date()) throw new ForbiddenException('Refresh token expired');
    // Vérifie l'inactivité
    const now = new Date();
    const maxInactive = new Date(refresh.lastUsedAt.getTime() + REFRESH_TOKEN_EXP_MINUTES * 60 * 1000);
    if (now > maxInactive) throw new ForbiddenException('Session inactive');
    // Met à jour la dernière activité
    refresh.lastUsedAt = now;
    await this.tokenRepo.save(refresh);
    return refresh;
  }

  async revoke(userId: string, token: string) {
    const refresh = await this.tokenRepo.findOne({ where: { user: { id: userId }, token }, relations: ['user'] });
    if (refresh) {
      refresh.revoked = true;
      await this.tokenRepo.save(refresh);
    }
    return { success: true };
  }
}