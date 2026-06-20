-- Produção: org Gravity para convite Super Admin (TASK-000302)
-- Rodar no Postgres do Configurador de PRODUÇÃO antes de convidar SAdmin.
-- Alternativa: ID_ORGANIZACAO_GRAVITY=<cuid> no Railway (serviço API Configurador).

-- 1) Diagnóstico
SELECT id_organizacao, nome_organizacao, subdominio_organizacao,
       status_organizacao, hospeda_colaboradores_gravity
FROM organizacao
WHERE hospeda_colaboradores_gravity = true
   OR TRIM(nome_organizacao) ILIKE '%gravity%intern%';

-- 2) Marcar org interna (ajuste o WHERE se o nome em prod for diferente)
UPDATE organizacao
SET nome_organizacao = TRIM(nome_organizacao),
    hospeda_colaboradores_gravity = true
WHERE TRIM(nome_organizacao) = 'Gravity - Interno';

-- 3) Conferência
SELECT id_organizacao, nome_organizacao, hospeda_colaboradores_gravity, status_organizacao
FROM organizacao
WHERE hospeda_colaboradores_gravity = true;
