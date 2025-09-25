import { Module } from '@nestjs/common';
import { SignaturesController } from './signatures.controller';
import { SignaturesService } from './signatures.service';
import { ICPBrasilModule } from '../../core/icp-brasil/icp-brasil.module';

@Module({
  imports: [ICPBrasilModule],
  controllers: [SignaturesController],
  providers: [SignaturesService],
  exports: [SignaturesService],
})
export class SignaturesModule {}