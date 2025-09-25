"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICPBrasilModule = void 0;
const common_1 = require("@nestjs/common");
const icp_brasil_certificate_handler_service_1 = require("./services/icp-brasil-certificate-handler.service");
const icp_brasil_signer_service_1 = require("./services/icp-brasil-signer.service");
const icp_brasil_validator_service_1 = require("./services/icp-brasil-validator.service");
let ICPBrasilModule = class ICPBrasilModule {
};
exports.ICPBrasilModule = ICPBrasilModule;
exports.ICPBrasilModule = ICPBrasilModule = __decorate([
    (0, common_1.Module)({
        providers: [
            icp_brasil_certificate_handler_service_1.ICPBrasilCertificateHandler,
            icp_brasil_signer_service_1.ICPBrasilSigner,
            icp_brasil_validator_service_1.ICPBrasilValidator,
        ],
        exports: [
            icp_brasil_certificate_handler_service_1.ICPBrasilCertificateHandler,
            icp_brasil_signer_service_1.ICPBrasilSigner,
            icp_brasil_validator_service_1.ICPBrasilValidator,
        ],
    })
], ICPBrasilModule);
//# sourceMappingURL=icp-brasil.module.js.map