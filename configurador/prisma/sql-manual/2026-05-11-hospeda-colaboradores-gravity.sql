-- Migration manual: adiciona hospeda_colaboradores_gravity em Organizacao
-- Decisão dono 2026-05-11 (skill seguranca/permissoes — regra de promoção SAdmin/ADMIN).

ALTER TABLE "organizacao"
ADD COLUMN IF NOT EXISTS "hospeda_colaboradores_gravity" BOOLEAN NOT NULL DEFAULT false;

-- Seed: marca a org "Gravity - Interno" (com trailing space — normalizar nome também)
UPDATE "organizacao"
SET nome_organizacao = TRIM(nome_organizacao),
    hospeda_colaboradores_gravity = true
WHERE TRIM(nome_organizacao) = 'Gravity - Interno';

-- Verificação
SELECT id_organizacao, nome_organizacao, subdominio_organizacao, hospeda_colaboradores_gravity
FROM organizacao
WHERE hospeda_colaboradores_gravity = true;
