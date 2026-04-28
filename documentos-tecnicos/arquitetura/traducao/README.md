# Documentação do Sistema de Idiomas (i18n)

Documentação técnica e funcional completa da internacionalização da plataforma Gravity.

## Índice

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Visão Geral](01-visao-geral.md) | O que é, por que foi feito, o que cobre, números |
| 02 | [Arquitetura Técnica](02-arquitetura-tecnica.md) | Stack, fluxo de dados, estrutura de arquivos, configuração, persistência |
| 03 | [Namespaces e Chaves](03-namespaces-e-chaves.md) | Mapa completo dos 45+ namespaces, convenções de nomenclatura, variáveis |
| 04 | [Pipeline Gemini](04-pipeline-traducao-gemini.md) | Como funciona a tradução automática, comandos, proteções, custo |
| 05 | [LanguageSwitcher](05-componente-language-switcher.md) | Componente visual, comportamento, props, acessibilidade, CSS |
| 06 | [Componentes Atualizados](06-componentes-atualizados.md) | Lista completa dos 50+ componentes com suas chaves i18n |
| 07 | [Testes](07-testes.md) | 33 unitários + 7 E2E, o que cada teste valida, como rodar |
| 08 | [Guia do Desenvolvedor](08-guia-do-desenvolvedor.md) | Como adicionar textos, idiomas, excluir namespaces, troubleshooting |

## Resumo executivo

- **3 idiomas:** Português (padrão), Inglês, Espanhol
- **950 chaves** de tradução organizadas em 45+ namespaces
- **50+ componentes** atualizados em toda a plataforma
- **Pipeline Gemini** traduz novas chaves automaticamente
- **33 testes unitários** + **7 cenários E2E** garantem integridade
- **pt.json é a fonte da verdade** — en.json e es.json são gerados

## Comandos principais

```bash
npm test                # Testes unitários (33)
npm run translate:check # Preview de tradução (dry-run)
npm run translate       # Traduzir via Gemini API
npm run test:e2e        # Testes E2E Playwright
```
