import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SignaturesModule } from './modules/signatures/signatures.module';
import { UsersModule } from './modules/users/users.module';
import { ICPBrasilModule } from './core/icp-brasil/icp-brasil.module';
import { AuditLoggerInterceptor } from './common/interceptors/audit-logger.interceptor';
import { ICPExceptionFilter } from './common/filters/icp-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
        redact: {
          paths: ['req.headers.authorization', 'req.body.certificatePassword'],
          censor: '[REDACTED]'
        },
        customProps: () => ({
          context: 'HTTP',
        }),
      },
    }),
    PrismaModule,
    ICPBrasilModule,
    AuthModule,
    DocumentsModule,
    SignaturesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ICPExceptionFilter,
    },
  ],
})
export class AppModule {}