import { Controller, Post, Body, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autenticação de usuário',
    description: 'Realiza login com email e senha, retornando token JWT para autenticação nas demais rotas'
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Credenciais inválidas' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['Email deve ter um formato válido', 'Senha é obrigatória']
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request
  ): Promise<LoginResponseDto> {
    const clientInfo = {
      ip: request.ip || request.socket.remoteAddress,
      userAgent: request.get('user-agent'),
    };

    return this.authService.login(loginDto, clientInfo);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout do usuário',
    description: 'Realiza logout do usuário autenticado (invalida token do lado servidor se implementado)'
  })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout realizado com sucesso' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async logout(@Req() request: any): Promise<{ message: string }> {
    const userId = request.user?.userId;
    const clientInfo = {
      ip: request.ip || request.socket.remoteAddress,
      userAgent: request.get('user-agent'),
    };

    await this.authService.logout(userId, clientInfo);

    return { message: 'Logout realizado com sucesso' };
  }
}