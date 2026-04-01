-- AlterTable: adiciona campos opcionais de cadastro ao Tenant
-- Campos adicionados ao schema.prisma após a migration init

ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "cnpj"    TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "state"   TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "city"    TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "segment" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "website" TEXT;
