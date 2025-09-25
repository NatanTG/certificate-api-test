"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const documents_service_1 = require("./documents.service");
const document_dto_1 = require("./dto/document.dto");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async uploadDocument(file, req) {
        return this.documentsService.uploadDocument(file, req.user.userId);
    }
    async signDocument(documentId, certificate, signDto, req) {
        return this.documentsService.signDocument(documentId, certificate, signDto.certificatePassword, req.user.userId, signDto.hashAlgorithm);
    }
    async verifyDocument(documentId, req) {
        return this.documentsService.verifyDocument(documentId, req.user.userId);
    }
    async downloadSignedDocument(documentId, req, res) {
        const signedDocument = await this.documentsService.downloadSignedDocument(documentId, req.user.userId);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="document-${documentId}.p7s"`);
        res.status(common_1.HttpStatus.OK).send(signedDocument);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload de documento para assinatura',
        description: 'Faz upload de um documento (PDF, DOC, TXT) que será posteriormente assinado digitalmente'
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Documento carregado com sucesso',
        type: document_dto_1.DocumentUploadResponseDto,
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)(':documentId/sign-icp'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('certificate')),
    (0, swagger_1.ApiOperation)({
        summary: 'Assinar documento com certificado ICP-Brasil',
        description: 'Assina um documento previamente carregado usando certificado digital ICP-Brasil (.p12/.pfx)'
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Documento assinado com sucesso',
        type: document_dto_1.DocumentSigningResponseDto,
    }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, document_dto_1.SignDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "signDocument", null);
__decorate([
    (0, common_1.Get)(':documentId/verify'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificar todas as assinaturas de um documento',
        description: 'Retorna informações detalhadas sobre todas as assinaturas digitais de um documento'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Verificação concluída com sucesso',
        type: document_dto_1.DocumentVerificationResponseDto,
    }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "verifyDocument", null);
__decorate([
    (0, common_1.Get)(':documentId/download/signed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Download do documento com assinaturas digitais embarcadas',
        description: 'Baixa o documento no formato P7S com todas as assinaturas digitais embarcadas'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Download realizado com sucesso',
        schema: {
            type: 'string',
            format: 'binary',
        },
    }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadSignedDocument", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('documents'),
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
let UsersController = class UsersController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async getMyDocuments(req) {
        return this.documentsService.getUserDocuments(req.user.userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('my-documents'),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar documentos do usuário autenticado',
        description: 'Retorna lista de todos os documentos carregados pelo usuário autenticado'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de documentos retornada com sucesso',
        type: document_dto_1.UserDocumentsResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyDocuments", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], UsersController);
//# sourceMappingURL=documents.controller.js.map