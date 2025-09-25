import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { AUDIT_LOG_TYPES } from '../../core/icp-brasil/constants/icp-brasil.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, clientInfo?: { ip?: string; userAgent?: string }): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    try {
      this.logger.debug(`Tentativa de login para: ${email}`);

      // Buscar usuário por email
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          createdAt: true,
        },
      });

      if (!user) {
        this.logger.warn(`Usuário não encontrado: ${email}`);
        await this.logAuditEvent(null, AUDIT_LOG_TYPES.USER_LOGIN, false, 'Usuário não encontrado', clientInfo);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        this.logger.warn(`Senha incorreta para usuário: ${email}`);
        await this.logAuditEvent(user.id, AUDIT_LOG_TYPES.USER_LOGIN, false, 'Senha incorreta', clientInfo);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Gerar token JWT
      const payload = { sub: user.id, email: user.email };
      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '24h');
      const token = this.jwtService.sign(payload, { expiresIn });

      // Calcular data de expiração
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas por padrão

      // Log de sucesso
      await this.logAuditEvent(user.id, AUDIT_LOG_TYPES.USER_LOGIN, true, 'Login bem-sucedido', clientInfo);

      this.logger.log(`Login bem-sucedido para usuário: ${email}`);

      return {
        token,
        userId: user.id,
        email: user.email,
        expiresAt,
      };

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Erro no login: ${error.message}`);
      throw new UnauthorizedException('Erro interno no processo de autenticação');
    }
  }

  async validateUser(userId: string): Promise<{ id: string; email: string; createdAt: Date } | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, createdAt: true },
      });

      return user;
    } catch (error) {
      this.logger.error(`Erro na validação do usuário ${userId}: ${error.message}`);
      return null;
    }
  }

  async createUser(email: string, password: string): Promise<{ id: string; email: string }> {
    try {
      this.logger.debug(`Criando novo usuário: ${email}`);

      // Verificar se usuário já existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('Usuário já existe com este email');
      }

      // Hash da senha
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
        },
      });

      this.logger.log(`Usuário criado com sucesso: ${email}`);

      return user;
    } catch (error) {
      this.logger.error(`Erro na criação do usuário: ${error.message}`);
      throw error;
    }
  }

  async logout(userId: string, clientInfo?: { ip?: string; userAgent?: string }): Promise<void> {
    try {
      // Log do logout
      await this.logAuditEvent(userId, AUDIT_LOG_TYPES.USER_LOGOUT, true, 'Logout realizado', clientInfo);

      this.logger.log(`Usuário ${userId} fez logout`);
    } catch (error) {
      this.logger.error(`Erro no logout: ${error.message}`);
    }
  }

  private async logAuditEvent(
    userId: string | null,
    action: string,
    success: boolean,
    details: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    try {
      // Em uma implementação completa, isso seria enviado para um sistema de auditoria
      // Por enquanto, apenas log
      const auditLog = {
        userId,
        action,
        resource: 'auth',
        success,
        details,
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
        timestamp: new Date(),
      };

      this.logger.log(`AUDIT: ${JSON.stringify(auditLog)}`);
    } catch (error) {
      this.logger.error(`Erro no log de auditoria: ${error.message}`);
    }
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  generatePasswordHash(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}