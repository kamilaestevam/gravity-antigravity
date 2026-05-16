-- Renomeia PKs para desambiguar:
-- id_exportador → id_exportador_quando_importacao (evita confusão com exportador BR)
-- id_importador → id_importador_quando_exportacao (evita confusão com importador BR)
-- Tabelas estão vazias — DROP + ADD é seguro.

-- AlterTable exportador_quando_importacao
ALTER TABLE "exportador_quando_importacao" DROP CONSTRAINT "exportador_quando_importacao_pkey",
DROP COLUMN "id_exportador",
ADD COLUMN     "id_exportador_quando_importacao" TEXT NOT NULL,
ADD CONSTRAINT "exportador_quando_importacao_pkey" PRIMARY KEY ("id_exportador_quando_importacao");

-- AlterTable importador_quando_exportacao
ALTER TABLE "importador_quando_exportacao" DROP CONSTRAINT "importador_quando_exportacao_pkey",
DROP COLUMN "id_importador",
ADD COLUMN     "id_importador_quando_exportacao" TEXT NOT NULL,
ADD CONSTRAINT "importador_quando_exportacao_pkey" PRIMARY KEY ("id_importador_quando_exportacao");
