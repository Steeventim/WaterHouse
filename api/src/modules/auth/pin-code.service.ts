import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PinCode } from './entities/pin-code.entity';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class PinCodeService {
  constructor(
    @InjectRepository(PinCode)
    private readonly pinRepo: Repository<PinCode>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async setupPin(userId: string, pin: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    const salt = crypto.randomBytes(16).toString('hex');
    const pinHash = this.hashPin(pin, salt);
    let pinCode = await this.pinRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (pinCode) {
      pinCode.pinHash = pinHash;
      pinCode.salt = salt;
      await this.pinRepo.save(pinCode);
    } else {
      pinCode = this.pinRepo.create({ user, pinHash, salt });
      await this.pinRepo.save(pinCode);
    }
    return { success: true };
  }

  async verifyPin(userId: string, pin: string) {
    const pinCode = await this.pinRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!pinCode) throw new BadRequestException('PIN not set');
    const hash = this.hashPin(pin, pinCode.salt);
    if (hash !== pinCode.pinHash) throw new ForbiddenException('Invalid PIN');
    return { success: true };
  }

  async resetPin(adminId: string, userId: string, newPin: string) {
    // Optionnel: vérifier que adminId correspond à un admin
    return this.setupPin(userId, newPin);
  }

  private hashPin(pin: string, salt: string): string {
    return crypto.pbkdf2Sync(pin, salt, 10000, 64, 'sha512').toString('hex');
  }
}