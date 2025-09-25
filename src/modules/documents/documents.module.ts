import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsController, UsersController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ICPBrasilModule } from '../../core/icp-brasil/icp-brasil.module';

@Module({
  imports: [
    ICPBrasilModule,
    MulterModule.register({
      limits: {
        fileSize: 52428800, // 50MB
      },
    }),
  ],
  controllers: [DocumentsController, UsersController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}