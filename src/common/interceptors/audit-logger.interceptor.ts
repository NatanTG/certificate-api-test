import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { AUDIT_LOG_TYPES } from '../../core/icp-brasil/constants/icp-brasil.constants';

@Injectable()
export class AuditLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AUDIT');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const user = request['user'];
    const startTime = Date.now();

    const auditLog = {
      userId: (user as any)?.userId || null,
      method: request.method,
      url: request.url,
      userAgent: request.get('user-agent'),
      ipAddress: request.ip || request.socket?.remoteAddress,
      timestamp: new Date().toISOString(),
      resource: this.extractResource(request.url),
      action: this.mapMethodToAction(request.method, request.url),
    };

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logger.log({
          ...auditLog,
          success: true,
          statusCode: response.statusCode,
          duration: `${duration}ms`,
          responseSize: JSON.stringify(data || {}).length,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error({
          ...auditLog,
          success: false,
          statusCode: error.status || 500,
          errorMessage: error.message,
          duration: `${duration}ms`,
        });
        throw error;
      })
    );
  }

  private extractResource(url: string): string {
    if (url.includes('/auth/')) return 'auth';
    if (url.includes('/documents/')) return 'documents';
    if (url.includes('/signatures/')) return 'signatures';
    if (url.includes('/users/')) return 'users';
    return 'unknown';
  }

  private mapMethodToAction(method: string, url: string): string {
    if (url.includes('/login')) return AUDIT_LOG_TYPES.USER_LOGIN;
    if (url.includes('/logout')) return AUDIT_LOG_TYPES.USER_LOGOUT;
    if (url.includes('/upload')) return AUDIT_LOG_TYPES.DOCUMENT_UPLOAD;
    if (url.includes('/sign-icp')) return AUDIT_LOG_TYPES.SIGNATURE_ATTEMPT;
    if (url.includes('/verify')) return AUDIT_LOG_TYPES.SIGNATURE_VERIFICATION;
    if (url.includes('/download')) return AUDIT_LOG_TYPES.DOCUMENT_DOWNLOAD;
    if (url.includes('/validate-detailed')) return AUDIT_LOG_TYPES.CERTIFICATE_VALIDATION;

    return `${method}_${url}`;
  }
}