import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { SUPPORTED_CERTIFICATE_FORMATS, ICP_ERROR_CODES } from '../../core/icp-brasil/constants/icp-brasil.constants';
import * as path from 'path';

@Injectable()
export class CertificateValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Certificado é obrigatório');
    }

    // Validar extensão do arquivo
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!SUPPORTED_CERTIFICATE_FORMATS.includes(fileExtension as any)) {
      throw new BadRequestException(
        `${ICP_ERROR_CODES.UNSUPPORTED_FORMAT}: Formato de certificado não suportado. Formatos aceitos: ${SUPPORTED_CERTIFICATE_FORMATS.join(', ')}`
      );
    }

    // Validar tamanho mínimo (certificados muito pequenos são suspeitos)
    if (file.size < 100) {
      throw new BadRequestException('Arquivo de certificado muito pequeno');
    }

    // Validar tamanho máximo (certificados muito grandes são suspeitos)
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new BadRequestException('Arquivo de certificado muito grande');
    }

    // Validar se é arquivo binário PKCS#12 (deve começar com bytes específicos)
    const header = file.buffer.slice(0, 4);
    const isPKCS12 = header[0] === 0x30 && header[1] === 0x82; // ASN.1 SEQUENCE

    if (!isPKCS12) {
      throw new BadRequestException('Arquivo não é um certificado PKCS#12 válido');
    }

    return file;
  }
}