import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiometricKey } from './entities/biometric-key.entity';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class BiometricKeyService {
  constructor(
    @InjectRepository(BiometricKey)
    private readonly bioRepo: Repository<BiometricKey>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async registerKey(userId: string, publicKey: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    let key = await this.bioRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (key) {
      key.publicKey = publicKey;
      await this.bioRepo.save(key);
    } else {
      key = this.bioRepo.create({ user, publicKey });
      await this.bioRepo.save(key);
    }
    return { success: true };
  }

  async verifySignature(userId: string, challenge: string, signature: string) {
    const key = await this.bioRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!key) throw new BadRequestException('Biometric key not set');
    // Pour la démo, on suppose une signature RSA SHA256
    const verifier = crypto.createVerify('SHA256');
    verifier.update(challenge);
    verifier.end();
    const isValid = verifier.verify(key.publicKey, signature, 'base64');
    if (!isValid) throw new ForbiddenException('Invalid biometric signature');
    return { success: true };
  }
}