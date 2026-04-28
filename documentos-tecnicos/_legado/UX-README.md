# UX — Documentação Técnica

> Padrões visuais, de layout e de experiência do usuário do ecossistema Gravity.

---

## Documentos

| Arquivo | Conteúdo |
|---------|----------|
| [layout-e-margens.md](./layout-e-margens.md) | Padrão de margens laterais, `max-width`, `layout-centered` vs `layout-full`, mapeamento por tela |
| [cores.html](./cores.html) | Sistema de cores completo — estratégia, prints de todas as zonas e produtos, tokens, regras de uso |

---

## Princípios Gerais

1. **Consistência antes de personalidade** — cada tela segue o padrão definido, não inventa um novo
2. **2rem como unidade lateral universal** — nunca usar valor diferente sem justificativa documentada
3. **Telas de trabalho = full-width / Telas de apresentação = 1280px centralizado**
4. **Topbars sempre full-width** — independente do layout da página
5. **Mobile-first com media query em 768px**
