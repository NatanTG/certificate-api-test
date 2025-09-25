import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import {
  DocumentUploadResponseDto,
  DocumentVerificationResponseDto,
  DocumentSigningResponseDto,
  SignDocumentDto,
  UserDocumentsResponseDto,
} from './dto/document.dto';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload de documento para assinatura',
    description: 'Faz upload de um documento (PDF, DOC, TXT) que será posteriormente assinado digitalmente'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Documento carregado com sucesso',
    type: DocumentUploadResponseDto,
  })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ): Promise<DocumentUploadResponseDto> {
    return this.documentsService.uploadDocument(file, req.user.userId);
  }

  @Post(':documentId/sign-icp')
  @UseInterceptors(FileInterceptor('certificate'))
  @ApiOperation({
    summary: 'Assinar documento com certificado ICP-Brasil',
    description: 'Assina um documento previamente carregado usando certificado digital ICP-Brasil (.p12/.pfx)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Documento assinado com sucesso',
    type: DocumentSigningResponseDto,
  })
  async signDocument(
    @Param('documentId') documentId: string,
    @UploadedFile() certificate: Express.Multer.File,
    @Body() signDto: SignDocumentDto,
    @Req() req: any
  ): Promise<DocumentSigningResponseDto> {
    return this.documentsService.signDocument(
      documentId,
      certificate,
      signDto.certificatePassword,
      req.user.userId,
      signDto.hashAlgorithm
    );
  }

  @Get(':documentId/verify')
  @ApiOperation({
    summary: 'Verificar todas as assinaturas de um documento',
    description: 'Retorna informações detalhadas sobre todas as assinaturas digitais de um documento'
  })
  @ApiResponse({
    status: 200,
    description: 'Verificação concluída com sucesso',
    type: DocumentVerificationResponseDto,
  })
  async verifyDocument(
    @Param('documentId') documentId: string,
    @Req() req: any
  ): Promise<DocumentVerificationResponseDto> {
    return this.documentsService.verifyDocument(documentId, req.user.userId);
  }

  @Get(':documentId/download/signed')
  @ApiOperation({
    summary: 'Download do documento com assinaturas digitais embarcadas',
    description: 'Baixa o documento no formato P7S com todas as assinaturas digitais embarcadas'
  })
  @ApiResponse({
    status: 200,
    description: 'Download realizado com sucesso',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  async downloadSignedDocument(
    @Param('documentId') documentId: string,
    @Req() req: any,
    @Res() res: Response
  ): Promise<void> {
    const signedDocument = await this.documentsService.downloadSignedDocument(documentId, req.user.userId);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="document-${documentId}.p7s"`);
    res.status(HttpStatus.OK).send(signedDocument);
  }
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('my-documents')
  @ApiOperation({
    summary: 'Listar documentos do usuário autenticado',
    description: 'Retorna lista de todos os documentos carregados pelo usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de documentos retornada com sucesso',
    type: UserDocumentsResponseDto,
  })
  async getMyDocuments(@Req() req: any): Promise<UserDocumentsResponseDto> {
    return this.documentsService.getUserDocuments(req.user.userId);
  }
}