"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../config/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const icp_brasil_constants_1 = require("../../core/icp-brasil/constants/icp-brasil.constants");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(loginDto, clientInfo) {
        const { email, password } = loginDto;
        try {
            this.logger.debug(`Tentativa de login para: ${email}`);
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
                await this.logAuditEvent(null, icp_brasil_constants_1.AUDIT_LOG_TYPES.USER_LOGIN, false, 'Usuário não encontrado', clientInfo);
                throw new common_1.UnauthorizedException('Credenciais inválidas');
            }
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                this.logger.warn(`Senha incorreta para usuário: ${email}`);
                await this.logAuditEvent(user.id, icp_brasil_constants_1.AUDIT_LOG_TYPES.USER_LOGIN, false, 'Senha incorreta', clientInfo);
                throw new common_1.UnauthorizedException('Credenciais inválidas');
            }
            const payload = { sub: user.id, email: user.email };
            const expiresIn = this.configService.get('JWT_EXPIRES_IN', '24h');
            const token = this.jwtService.sign(payload, { expiresIn });
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            await this.logAuditEvent(user.id, icp_brasil_constants_1.AUDIT_LOG_TYPES.USER_LOGIN, true, 'Login bem-sucedido', clientInfo);
            this.logger.log(`Login bem-sucedido para usuário: ${email}`);
            return {
                token,
                userId: user.id,
                email: user.email,
                expiresAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Erro no login: ${error.message}`);
            throw new common_1.UnauthorizedException('Erro interno no processo de autenticação');
        }
    }
    async validateUser(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, createdAt: true },
            });
            return user;
        }
        catch (error) {
            this.logger.error(`Erro na validação do usuário ${userId}: ${error.message}`);
            return null;
        }
    }
    async createUser(email, password) {
        try {
            this.logger.debug(`Criando novo usuário: ${email}`);
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new Error('Usuário já existe com este email');
            }
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);
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
        }
        catch (error) {
            this.logger.error(`Erro na criação do usuário: ${error.message}`);
            throw error;
        }
    }
    async logout(userId, clientInfo) {
        try {
            await this.logAuditEvent(userId, icp_brasil_constants_1.AUDIT_LOG_TYPES.USER_LOGOUT, true, 'Logout realizado', clientInfo);
            this.logger.log(`Usuário ${userId} fez logout`);
        }
        catch (error) {
            this.logger.error(`Erro no logout: ${error.message}`);
        }
    }
    async logAuditEvent(userId, action, success, details, clientInfo) {
        try {
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
        }
        catch (error) {
            this.logger.error(`Erro no log de auditoria: ${error.message}`);
        }
    }
    verifyToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
    generatePasswordHash(password) {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map