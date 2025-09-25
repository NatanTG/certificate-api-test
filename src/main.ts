import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API de Assinatura Digital ICP-Brasil')
      .setDescription('API compatível com padrões ITI/ICP-Brasil para assinatura digital de documentos')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticação')
      .addTag('documents', 'Gestão de Documentos')
      .addTag('signatures', 'Assinatura Digital ICP-Brasil')
      .addTag('users', 'Usuários')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Ensure required directories exist
  const requiredDirs = [
    process.env.UPLOAD_PATH || './uploads',
    process.env.TEMP_PATH || './temp',
    process.env.LOGS_PATH || './logs',
  ];

  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.log(`Created directory: ${dir}`);
    }
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 API de Assinatura Digital ICP-Brasil iniciada na porta ${port}`);
  logger.log(`📚 Documentação disponível em http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});