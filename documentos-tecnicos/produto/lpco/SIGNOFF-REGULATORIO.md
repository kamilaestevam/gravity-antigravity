# Sign-Off Regulatorio — LPCO

> **Elaborado por:** SME — Dream Team de Produtos
> **Data:** 30/03/2026
> **Status:** Aprovado

---

## Conformidade Regulatoria

| Regulamento | Status | Observacao |
|-----------|--------|-----------|
| Portaria SECEX 19/2019 (exportacao) | Conforme | LPCO exportacao segue modelo do Portal Unico |
| Portaria SECEX 77/2021 (importacao) | Conforme | LPCO importacao com Catalogo de Produtos |
| Lei 9.784/1999 (processo administrativo) | Conforme | Prazo de 30 dias para manifestacao respeitado nos alertas |
| Regra 90 dias cancelamento | Conforme | Cron job implementa cancelamento automatico |
| ICP-Brasil (certificado digital) | Conforme | Aceita e-CNPJ/e-CPF A1/A3 via .pfx |
| LGPD (dados pessoais) | Conforme | Certificados criptografados AES-256-GCM, sem log de dados sensiveis |
| Acordo OMC Facilitacao Comercio | Conforme | Sistema facilita o processo, nao cria barreiras adicionais |

## Armadilhas Regulatorias

| # | Armadilha | Mitigacao no Gravity |
|---|----------|---------------------|
| 1 | Atributos de LPCO mudam via Comunicado Siscomex sem aviso | Formularios dinamicos via JSON schema, atualizavel sem deploy |
| 2 | Orgao anuente pode negar registro se dados inconsistentes | Validacao Zod pre-registro espelha regras do Portal Unico |
| 3 | LPCO cancelada automaticamente nao pode ser recuperada | Alertas em 60/80/90 dias + email urgente em 80 dias |
| 4 | Certificado digital vence e bloqueia operacoes | Alerta 30 dias antes + dashboard de credenciais |
| 5 | Token OAuth2 pode ter scope limitado (so consulta) | Strategy pattern: detecta scope e avisa usuario se nao pode registrar |

## Declaracao

O produto LPCO, conforme especificado no PRD v1.0 e na Arquitetura Tecnica, esta em conformidade com a legislacao brasileira de comercio exterior vigente. O sistema nao substitui o Portal Unico Siscomex — funciona como camada de gestao e integracao.

**SME Sign-Off:** Aprovado para handoff ao Dream Team de Tecnologia.
