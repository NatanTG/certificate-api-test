-- CreateEnum
CREATE TYPE "public"."ValidationStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'REVOKED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."icp_signatures" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signature_data" TEXT NOT NULL,
    "signed_document_data" TEXT,
    "certificate_subject" TEXT NOT NULL,
    "certificate_issuer" TEXT NOT NULL,
    "certificate_serial_number" TEXT NOT NULL,
    "certificate_not_before" TIMESTAMP(3) NOT NULL,
    "certificate_not_after" TIMESTAMP(3) NOT NULL,
    "signer_cpf_cnpj" TEXT,
    "signature_algorithm" TEXT NOT NULL,
    "hash_algorithm" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validation_status" "public"."ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "last_validation_at" TIMESTAMP(3),
    "validation_errors" JSONB,

    CONSTRAINT "icp_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."validation_logs" (
    "id" TEXT NOT NULL,
    "signature_id" TEXT NOT NULL,
    "validation_type" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "validated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validator_info" JSONB,

    CONSTRAINT "validation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."icp_signatures" ADD CONSTRAINT "icp_signatures_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."validation_logs" ADD CONSTRAINT "validation_logs_signature_id_fkey" FOREIGN KEY ("signature_id") REFERENCES "public"."icp_signatures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
