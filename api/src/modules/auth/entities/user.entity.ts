import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index, BeforeInsert, BeforeUpdate, AfterLoad } from 'typeorm';
import { EncryptionService } from '../../../common/encryption.service';

@Entity('users')
@Index('idx_users_phone', ['phoneNumber'])
@Index('idx_users_active', ['isActive'])
export class User {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone_iv?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone_tag?: string;

  private _plainPhone?: string;

  @AfterLoad()
  decryptPhone() {
    if (this.phoneNumber && this.phone_iv && this.phone_tag) {
      try {
        this._plainPhone = EncryptionService.decrypt(this.phoneNumber, this.phone_iv, this.phone_tag);
      } catch {
        this._plainPhone = undefined;
      }
    } else {
      this._plainPhone = undefined;
    }
  }

  get plainPhone(): string | undefined {
    return this._plainPhone;
  }

  set plainPhone(val: string | undefined) {
    this._plainPhone = val;
  }

  @Column({ type: 'varchar', length: 20, default: 'collector' })
  role: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  name_iv?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  name_tag?: string;

  // Pour garder la valeur déchiffrée temporairement
  private _plainName?: string;

  @AfterLoad()
  decryptName() {
    if (this.name && this.name_iv && this.name_tag) {
      try {
        this._plainName = EncryptionService.decrypt(this.name, this.name_iv, this.name_tag);
      } catch {
        this._plainName = undefined;
      }
    } else {
      this._plainName = undefined;
    }
  }

  get plainName(): string | undefined {
    return this._plainName;
  }

  set plainName(val: string | undefined) {
    this._plainName = val;
  }

  @BeforeInsert()
  @BeforeUpdate()
  encryptName() {
    // Chiffre le nom
    if (typeof this._plainName === 'string' && this._plainName.length > 0) {
      const encrypted = EncryptionService.encrypt(this._plainName);
      this.name = encrypted.cipherText;
      this.name_iv = encrypted.iv;
      this.name_tag = encrypted.tag;
    }
    // Chiffre le téléphone
    if (typeof this._plainPhone === 'string' && this._plainPhone.length > 0) {
      const encrypted = EncryptionService.encrypt(this._plainPhone);
      this.phoneNumber = encrypted.cipherText;
      this.phone_iv = encrypted.iv;
      this.phone_tag = encrypted.tag;
    }
  }

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
