-- Renomeia colunas de contato do parceiro COMEX (Fornecedor) — DDD sem sufixo _principal_
ALTER TABLE "fornecedor" RENAME COLUMN "email_principal_fornecedor" TO "email_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "telefone_principal_fornecedor" TO "telefone_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "whatsapp_principal_fornecedor" TO "whatsapp_fornecedor";
