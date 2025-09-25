import { Module } from '@nestjs/common';
import { ICPBrasilCertificateHandler } from './services/icp-brasil-certificate-handler.service';
import { ICPBrasilSigner } from './services/icp-brasil-signer.service';
import { ICPBrasilValidator } from './services/icp-brasil-validator.service';

@Module({
  providers: [
    ICPBrasilCertificateHandler,
    ICPBrasilSigner,
    ICPBrasilValidator,
  ],
  exports: [
    ICPBrasilCertificateHandler,
    ICPBrasilSigner,
    ICPBrasilValidator,
  ],
})
export class ICPBrasilModule {}