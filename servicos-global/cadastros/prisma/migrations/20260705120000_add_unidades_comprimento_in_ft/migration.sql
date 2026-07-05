-- Unidades de comprimento IN (polegada) e FT (pé) — SSOT Cadastros para dimensões de cubagem Bid Frete

INSERT INTO "unidade" ("codigo_unidade", "nome_unidade", "tipo_unidade", "ativo_unidade")
VALUES
  ('IN', 'Polegada', 'comprimento', true),
  ('FT', 'Pé', 'comprimento', true)
ON CONFLICT ("codigo_unidade") DO UPDATE SET
  "nome_unidade" = EXCLUDED."nome_unidade",
  "tipo_unidade" = EXCLUDED."tipo_unidade",
  "ativo_unidade" = EXCLUDED."ativo_unidade";
