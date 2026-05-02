-- Migration: rename_template_pedido_pdf_para_template_pedido
-- RENAME TABLE template_pedido_pdf → template_pedido + 3 RENAME INDEX
-- Aplicada manualmente em transacao em 2026-05-02 (tabela vazia, 0 rows).
--
-- Contexto:
-- O sufixo "_pdf" no nome da tabela era enganoso. A tabela armazena TEMPLATES
-- HTML do Pedido. PDF e' apenas UM dos formatos de output (a tabela poderia
-- gerar Word, Excel, etc. usando o mesmo HTML como base).
-- Decisao: remover "_pdf" de toda a hierarquia (tabela, model, accessor,
-- file, router, URLs, tipos TS).
--
-- Renames:
-- - Tabela: template_pedido_pdf → template_pedido
-- - 3 indexes: tudo com prefixo template_pedido_*
-- - Model Prisma: PedidoTemplatePDF → PedidoTemplate
-- - File rota: relatorios-pdf-pedido.ts → template-pedido.ts
-- - Router export: pdfRouter → templatePedidoRota
-- - URL base: /api/v1/pedidos/relatorios-pdf → /api/v1/pedidos/template-pedido
-- - URL list: /relatorios-pdf/templates → /template-pedido (sem subpath redundante)
-- - URL gerar: /relatorios-pdf/gerar → /template-pedido/gerar
-- - URL docs: /relatorios-pdf/documentos/gerar → /template-pedido/documentos/gerar
-- - URL CRUD: /relatorios-pdf/templates → /template-pedido (POST/PUT/DELETE)
-- - TS types: TemplatePdf → TemplatePedido, PdfTemplate → TemplateLocal
-- - TS api: pdfApi → templatePedidoApi
--
-- BUG corrigido no caminho:
-- - relatorios-pdf-pedido.ts:129 chamava db.pedidoTemplate (model PedidoTemplatePDF
--   geraria accessor pedidoTemplatePdf — bug bloqueado por as any). Apos rename
--   do model PedidoTemplatePDF → PedidoTemplate, o accessor db.pedidoTemplate
--   FICA CORRETO automaticamente.
-- - db.pedidoAnexo.create usava 11 campos legacy (id, tenant_id, vinculo,
--   vinculo_id, nome_arquivo, etc.) que nao existem mais no schema atual
--   (ja renomeado pra id_anexo_pedido, id_organizacao, vinculo_anexo_pedido, etc.).
--   Atualizado em ambas chamadas (POST /gerar + POST /documentos/gerar).
--
-- Tabela duplicata em gravity-servicos-teste.public foi DROPada.

ALTER TABLE "template_pedido_pdf" RENAME TO "template_pedido";
ALTER INDEX "template_pedido_pdf_pkey"                          RENAME TO "template_pedido_pkey";
ALTER INDEX "template_pedido_pdf_id_organizacao_idx"             RENAME TO "template_pedido_id_organizacao_idx";
ALTER INDEX "template_pedido_pdf_id_organizacao_id_produto_idx"  RENAME TO "template_pedido_id_organizacao_id_produto_gravity_idx";
