-- condicao_pagamento_siscomex + normalização cobertura cambial legada

ALTER TABLE "pedido" ADD COLUMN IF NOT EXISTS "condicao_pagamento_siscomex_pedido" TEXT;
ALTER TABLE "pedido_item" ADD COLUMN IF NOT EXISTS "condicao_pagamento_siscomex_item" TEXT;

UPDATE "pedido" SET "cobertura_cambial_pedido" = 'SEM_COBERTURA'
  WHERE "cobertura_cambial_pedido" IN ('sem_cobertura', 'SEM COBERTURA', 'Sem cobertura cambial');

UPDATE "pedido" SET "cobertura_cambial_pedido" = 'ATE_180_DIAS'
  WHERE "cobertura_cambial_pedido" IN ('com_cobertura', 'COM COBERTURA', 'Com cobertura cambial');

UPDATE "pedido_item" SET "cobertura_cambial_item" = 'SEM_COBERTURA'
  WHERE "cobertura_cambial_item" IN ('sem_cobertura', 'SEM COBERTURA', 'Sem cobertura cambial');

UPDATE "pedido_item" SET "cobertura_cambial_item" = 'ATE_180_DIAS'
  WHERE "cobertura_cambial_item" IN ('com_cobertura', 'COM COBERTURA', 'Com cobertura cambial');
