import { PipeTransform } from '@nestjs/common';
export declare class CertificateValidationPipe implements PipeTransform {
    transform(file: Express.Multer.File): Express.Multer.File;
}
