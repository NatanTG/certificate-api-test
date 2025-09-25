import { Module } from '@nestjs/common';

@Module({
  // O módulo de usuários está sendo usado através do DocumentsModule
  // para o endpoint /users/my-documents
})
export class UsersModule {}