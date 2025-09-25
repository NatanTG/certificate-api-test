import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ICP_ERROR_CODES } from '../../core/icp-brasil/constants/icp-brasil.constants';

@Catch()
export class ICPExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ICPExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
        message = exceptionResponse['message'];
      }
    } else if (exception.message) {
      // Mapear erros ICP-Brasil específicos
      message = exception.message;

      if (message.includes(ICP_ERROR_CODES.INVALID_CERTIFICATE)) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ICP_ERROR_CODES.INVALID_CERTIFICATE;
      } else if (message.includes(ICP_ERROR_CODES.CERTIFICATE_EXPIRED)) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ICP_ERROR_CODES.CERTIFICATE_EXPIRED;
      } else if (message.includes(ICP_ERROR_CODES.CERTIFICATE_REVOKED)) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ICP_ERROR_CODES.CERTIFICATE_REVOKED;
      } else if (message.includes(ICP_ERROR_CODES.SIGNATURE_INVALID)) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ICP_ERROR_CODES.SIGNATURE_INVALID;
      } else if (message.includes(ICP_ERROR_CODES.FILE_TOO_LARGE)) {
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        errorCode = ICP_ERROR_CODES.FILE_TOO_LARGE;
      }
    }

    // Log do erro
    this.logger.error({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorCode,
      message,
      stack: exception.stack,
      userId: request.user?.userId,
    });

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      errorCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
    };

    response.status(status).json(errorResponse);
  }
}