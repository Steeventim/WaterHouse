import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { BiometricKeyService } from './biometric-key.service';
import { RegisterBioDto } from './dto/register-bio.dto';
import { VerifyBioDto } from './dto/verify-bio.dto';
// Interface pour le payload utilisateur injecté par le guard
interface JwtUserPayload {
  id: string;
  phoneNumber: string;
  role: string;
  name?: string;
}
import { PinCodeService } from './pin-code.service';
import { SetupPinDto } from './dto/setup-pin.dto';
import { LoginPinDto } from './dto/login-pin.dto';


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
    private readonly pinCodeService: PinCodeService,
    private readonly biometricKeyService: BiometricKeyService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}
      /**
       * Endpoint pour obtenir un refresh token après login (à appeler après login OTP/PIN/Bio)
       */
      @UseGuards(JwtAuthGuard)
      @Post('refresh-token/issue')
      async issueRefreshToken(@Request() req: { user: JwtUserPayload }) {
        return this.refreshTokenService.issue(req.user.id);
      }

      /**
       * Endpoint pour rafraîchir le JWT avec un refresh token valide
       */
      @Post('refresh-token')
      async refreshToken(@Body() body: RefreshTokenDto) {
        await this.refreshTokenService.verify(body.userId, body.refreshToken);
        // On retourne un nouveau JWT
        const user = await this.usersService['repo']?.findOne({ where: { id: body.userId } })
          ?? this.usersService.allUsers.find(u => u.id === body.userId);
        if (!user) throw new ForbiddenException('User not found');
        return this.authService.login(user);
      }

      /**
       * Endpoint pour logout (révoque le refresh token)
       */
      @Post('logout')
      async logout(@Body() body: RefreshTokenDto) {
        return this.refreshTokenService.revoke(body.userId, body.refreshToken);
      }
    /**
     * Enregistrement d'une clé biométrique (clé publique)
     */
    @UseGuards(JwtAuthGuard)
    @Post('register-bio')
    async registerBio(@Request() req: { user: JwtUserPayload }, @Body() body: RegisterBioDto) {
      // L'utilisateur doit être admin ou le user concerné
      if (req.user.role !== 'admin' && req.user.id !== body.userId) throw new ForbiddenException('Not allowed');
      return this.biometricKeyService.registerKey(body.userId, body.publicKey);
    }

    /**
     * Authentification biométrique (vérification de signature)
     */
    @Post('verify-bio')
    async verifyBio(@Body() body: VerifyBioDto) {
      await this.biometricKeyService.verifySignature(body.userId, body.challenge, body.signature);
      // On retourne le même format que login classique
      const user = await this.usersService['repo']?.findOne({ where: { id: body.userId } })
        ?? this.usersService.allUsers.find(u => u.id === body.userId);
      if (!user) throw new ForbiddenException('User not found');
      return this.authService.login(user);
    }
  /**
   * Setup PIN pour l'utilisateur connecté
   */
  @UseGuards(JwtAuthGuard)
  @Post('setup-pin')
  async setupPin(@Request() req: { user: JwtUserPayload }, @Body() body: SetupPinDto) {
    // L'utilisateur doit être connecté
    return this.pinCodeService.setupPin(req.user.id, body.pin);
  }

  /**
   * Authentification par PIN (retourne JWT si succès)
   */
  @Post('login-pin')
  async loginPin(@Body() body: LoginPinDto) {
    await this.pinCodeService.verifyPin(body.userId, body.pin);
    // On retourne le même format que login classique
    const user = await this.usersService['repo']?.findOne({ where: { id: body.userId } })
      ?? this.usersService.allUsers.find(u => u.id === body.userId);
    if (!user) throw new ForbiddenException('User not found');
    return this.authService.login(user);
  }

  /**
   * Réinitialisation du PIN par un admin
   */
  @UseGuards(JwtAuthGuard)
  @Post('users/:id/reset-pin')
  async resetPin(@Param('id') id: string, @Body() body: SetupPinDto, @Request() req: { user: JwtUserPayload }) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.pinCodeService.resetPin(req.user.id, id, body.pin);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users/:id/reset-otp')
  async resetOtp(@Param('id') id: string, @Request() req: { user: JwtUserPayload }) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.authService.resetOtp(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('users/batch-activate')
  async batchActivate(
    @Body('ids') ids: string[],
    @Request() req: { user: JwtUserPayload },
  ) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.batchSetActive(ids, true);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/batch-deactivate')
  async batchDeactivate(
    @Body('ids') ids: string[],
    @Request() req: { user: JwtUserPayload },
  ) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.batchSetActive(ids, false);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: JwtUserPayload }) {
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
  async createUser(@Body() body: CreateUserDto, @Request() req: { user: JwtUserPayload }) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/activate')
  async activateUser(@Param('id') id: string, @Request() req: { user: JwtUserPayload }) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.setActive(id, true);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/deactivate')
  async deactivateUser(@Param('id') id: string, @Request() req: { user: JwtUserPayload }) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.setActive(id, false);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req: { user: JwtUserPayload }) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async listUsers(
    @Request() req: { user: JwtUserPayload },
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
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto, @Request() req: { user: JwtUserPayload }) {
    if (req.user?.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.usersService.update(id, body);
  }
}
