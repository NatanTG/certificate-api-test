import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto, clientInfo?: {
        ip?: string;
        userAgent?: string;
    }): Promise<LoginResponseDto>;
    validateUser(userId: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
    } | null>;
    createUser(email: string, password: string): Promise<{
        id: string;
        email: string;
    }>;
    logout(userId: string, clientInfo?: {
        ip?: string;
        userAgent?: string;
    }): Promise<void>;
    private logAuditEvent;
    verifyToken(token: string): any;
    generatePasswordHash(password: string): Promise<string>;
}
