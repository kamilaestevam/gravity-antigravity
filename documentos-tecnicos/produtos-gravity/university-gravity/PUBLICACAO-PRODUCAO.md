# Gravity University — Publicação em produção

> **Status:** Manual/Academy **congelado fora de produção** (2026-07-15)  
> **Decisão:** Daniel Mendes (PO MASTER / `gravity_admin`)  
> **Motivo:** a plataforma já dispõe do **Guia Gravity** (help contextual); o módulo University (`/university-gravity/*`) segue em desenvolvimento no repositório, sem exposição a clientes até nova aprovação explícita do PO.

---

## Regra operacional

| Ambiente | Comportamento |
|----------|----------------|
| **Dev local — Academy** | Guia Gravity (`/academy/*`) **visível** na porta 8002 |
| **Dev local — Manuais** | Seção **Manuais** (`/docs/*`) **oculta** salvo `VITE_UNIVERSITY_MANUAIS_DOCS_PUBLICA=true` em `.env.local` |
| **Produção** | University **oculta** por padrão (fail-closed) |
| **Produção + flag** | Só exibe se `VITE_UNIVERSITY_GRAVITY_PUBLICA=true` no Railway |

O código **não é removido** do git: merge e deploy podem incluir arquivos `manual-*.ts(x)` sem publicar o módulo.

**Documentação técnica da jornada (dev):** [GUIA-GRAVITY-JORNADA-TECNICO.md](./GUIA-GRAVITY-JORNADA-TECNICO.md)

---

## SSOT no código

- `university-gravity-publicacao.ts` — `universityGravityPublicada()` e `universityManuaisDocsVisiveis()`
- `UniversityGravity.tsx` — menu Manuais, barra «Manuais lidos» e redirect `/docs/*`
- `servicos-global/configurador/src/App.tsx` — `UniversityGravityGate` + rota `/university-gravity/*`
- `servicos-global/configurador/src/pages/Hub.tsx` — botão do capelo (GraduationCap) só quando publicado

---

## Railway (Configurador — produção)

**Não definir** a variável, ou definir explicitamente:

```env
VITE_UNIVERSITY_GRAVITY_PUBLICA=false
```

Para **reativar** (somente após OK do PO MASTER):

```env
VITE_UNIVERSITY_GRAVITY_PUBLICA=true
```

Rebuild obrigatório após alterar (variável Vite é embutida no bundle).

---

## Retomada futura

1. PO MASTER aprova publicação (registro em task/decisão).
2. Coordenador valida staging com flag `true`.
3. Deploy produção com flag `true`.
4. (Opcional) catálogo por produto/capítulo para liberação gradual.

---

## Relacionados

- `PRD.md` — visão de produto University (rascunho)
- `MANUAL-GRAVITY-ONBOARDING.md` — padrão editorial do Guia/Manual no código
- `skills/produtos-gravity/university-gravity/manual-gravity-onboarding/SKILL.md` — agentes que editam conteúdo
