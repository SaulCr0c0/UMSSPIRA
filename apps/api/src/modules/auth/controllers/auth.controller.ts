// apps/api/src/modules/auth/controllers/auth.controller.ts
import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../contracts/dto';
import { AuthGuard, RolesGuard, RequestWithUser } from '@/shared/guards';
import { Roles } from '@/shared/decorators/roles.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return { data };
  }

  /**
   * Endpoint de prueba para verificar que AuthGuard funciona de punta a
   * punta: exige un Bearer token válido y devuelve el usuario que el
   * guard extrajo. No exige ningún rol en particular (sin @Roles()).
   */
  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() request: RequestWithUser) {
    return { data: request.user };
  }

  /**
   * Endpoint de prueba para verificar la cadena completa de permisos:
   * AuthGuard valida el token y RolesGuard exige que el rol sea
   * "administrador". Un token válido de un usuario con otro rol debe
   * recibir 403 (ForbiddenError), no 401.
   */
  @Get('solo-admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  soloAdmin(@Req() request: RequestWithUser) {
    return { data: request.user };
  }
}