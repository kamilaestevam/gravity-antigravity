-- AlterTable
ALTER TABLE "organizacao" ADD COLUMN     "suid_empresa" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organizacao_suid_empresa_key" ON "organizacao"("suid_empresa");

