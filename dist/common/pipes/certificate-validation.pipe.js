"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const icp_brasil_constants_1 = require("../../core/icp-brasil/constants/icp-brasil.constants");
const path = __importStar(require("path"));
let CertificateValidationPipe = class CertificateValidationPipe {
    transform(file) {
        if (!file) {
            throw new common_1.BadRequestException('Certificado é obrigatório');
        }
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!icp_brasil_constants_1.SUPPORTED_CERTIFICATE_FORMATS.includes(fileExtension)) {
            throw new common_1.BadRequestException(`${icp_brasil_constants_1.ICP_ERROR_CODES.UNSUPPORTED_FORMAT}: Formato de certificado não suportado. Formatos aceitos: ${icp_brasil_constants_1.SUPPORTED_CERTIFICATE_FORMATS.join(', ')}`);
        }
        if (file.size < 100) {
            throw new common_1.BadRequestException('Arquivo de certificado muito pequeno');
        }
        if (file.size > 10 * 1024 * 1024) {
            throw new common_1.BadRequestException('Arquivo de certificado muito grande');
        }
        const header = file.buffer.slice(0, 4);
        const isPKCS12 = header[0] === 0x30 && header[1] === 0x82;
        if (!isPKCS12) {
            throw new common_1.BadRequestException('Arquivo não é um certificado PKCS#12 válido');
        }
        return file;
    }
};
exports.CertificateValidationPipe = CertificateValidationPipe;
exports.CertificateValidationPipe = CertificateValidationPipe = __decorate([
    (0, common_1.Injectable)()
], CertificateValidationPipe);
//# sourceMappingURL=certificate-validation.pipe.js.map