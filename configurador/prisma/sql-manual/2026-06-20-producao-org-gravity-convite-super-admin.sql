-- Produção: org Gravity para convite Super Admin (TASK-000302)
-- Rodar no Postgres do Configurador de PRODUÇÃO antes de convidar SAdmin.
-- Alternativa: ID_ORGANIZACAO_GRAVITY=<cuid> no Railway (serviço API Configurador).

-- 1) Diagnóstico
SELECT id_organizacao, nome_organizacao, subdominio_organizacao,
       status_organizacao, hospeda_colaboradores_gravity
FROM organizacao
WHERE hospeda_colaboradores_gravity = true
   OR TRIM(nome_organizacao) ILIKE '%gravity%intern%';

-- 2) Marcar org interna (nome canônico ou subdomínio gravity)
UPDATE organizacao
SET nome_organizacao = TRIM(nome_organizacao),
    hospeda_colaboradores_gravity = true
WHERE status_organizacao = 'ATIVO'
  AND (
    TRIM(nome_organizacao) = 'Gravity - Interno'
    OR subdominio_organizacao = 'gravity'
  );

-- 3) Conferência
SELECT id_organizacao, nome_organizacao, hospeda_colaboradores_gravity, status_organizacao
FROM organizacao
WHERE hospeda_colaboradores_gravity = true;
