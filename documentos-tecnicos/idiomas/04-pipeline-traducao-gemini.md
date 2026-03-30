# Pipeline de Tradução Automática (Gemini)

## Conceito

O `pt.json` é a **única fonte da verdade**. Ninguém edita `en.json` ou `es.json` manualmente. Quando novos textos são adicionados em português, o pipeline de tradução os detecta automaticamente e envia para a API do Gemini para tradução.

## Comandos

```bash
# Ver o que seria traduzido (não chama API, não altera arquivos)
npm run translate:check

# Traduzir chaves faltantes via Gemini API
npm run translate
```

## Pré-requisito: API Key

Criar arquivo `.env.local` na raiz do projeto:

```env
GEMINI_API_KEY=AIzaSy...sua_chave_aqui
```

A chave pode ser obtida em https://aistudio.google.com/apikey

Sem a chave, o comando `npm run translate` falha com mensagem clara. O `npm run translate:check` funciona sem chave (apenas lista).

## Como o Pipeline Funciona

### Passo 1 — Leitura

```
pt.json (950 chaves) → flatten → mapa plano de chaves
en.json (924 chaves) → flatten → mapa plano de chaves
es.json (924 chaves) → flatten → mapa plano de chaves
```

### Passo 2 — Comparação

Para cada idioma alvo (en, es):
- Identifica chaves que existem em pt.json mas não no alvo
- Identifica chaves com valor vazio no alvo
- Ignora chaves do namespace `admin.cockpit` (excluídas por design)

### Passo 3 — Tradução

Envia as chaves faltantes para o Gemini em **lotes de 50** com o prompt:

```
Traduza os seguintes textos de português para [idioma]. Retorne APENAS
um JSON válido com as mesmas chaves. Preserve variáveis como {nome},
{valor}, {{count}}, tags HTML, e letras maiúsculas intencionais.
Contexto: são textos de interface de uma plataforma SaaS de
logística/comércio exterior.
```

Configuração da API:
- Modelo: `gemini-2.0-flash`
- Temperature: `0.1` (traduções consistentes)
- Response MIME: `application/json` (parsing confiável)

### Passo 4 — Merge Seguro

```
en.json existente + novas traduções = en.json atualizado
```

**Regra: nunca sobrescreve tradução existente.** Se a chave já tem valor no alvo, o valor novo é descartado. Isso permite ajustes manuais que não são perdidos em execuções futuras.

### Passo 5 — Salvamento

O arquivo JSON é salvo com indentação de 2 espaços e newline final.

## Exemplo de Saída

```
$ npm run translate:check

📖 pt.json: 950 chaves totais
🚫 Namespaces excluídos: admin.cockpit

── EN (inglês) ──
   Existentes: 924
   Faltantes:  0
   Extras:     0
   ✅ Todas as chaves traduzidas!

── ES (espanhol) ──
   Existentes: 924
   Faltantes:  0
   Extras:     0
   ✅ Todas as chaves traduzidas!

🏁 Pipeline de tradução concluído.
```

Quando há chaves faltantes:

```
── EN (inglês) ──
   Existentes: 920
   Faltantes:  4
   Extras:     0
   📋 Chaves que seriam traduzidas:
      - simulacusto.nova_funcionalidade: "Nova funcionalidade"
      - simulacusto.outra_chave: "Outra chave"
      - bidfrete.novo_campo: "Novo campo"
      - pedido.novo_status: "Novo status"
```

## Namespaces Excluídos

A constante `SKIP_NAMESPACES` no script define quais namespaces são ignorados:

```typescript
const SKIP_NAMESPACES = ['admin.cockpit']
```

Chaves que começam com qualquer prefixo desta lista:
- Não são contadas como "faltantes"
- Não são enviadas ao Gemini
- Não são cobradas nos testes de integridade

### Como adicionar mais exclusões

Editar `SKIP_NAMESPACES` em 3 arquivos:

1. `scripts/translate.ts` — pipeline de tradução
2. `testes/testes-unitarios/i18n/translate-script.test.ts` — testes do script
3. `testes/testes-unitarios/i18n/messages-integrity.test.ts` — testes de integridade

## Proteções

| Proteção | Descrição |
|----------|-----------|
| Nunca sobrescreve | Tradução existente não é substituída |
| Lotes de 50 | Evita timeout e limites da API |
| Temperature 0.1 | Traduções previsíveis e consistentes |
| JSON tipado | `responseMimeType: application/json` |
| Fallback gracioso | Se um lote falha, os demais continuam |
| Validação de chave | Script exige `GEMINI_API_KEY` antes de chamar API |
| Dry-run | `--dry-run` lista sem chamar API nem salvar |

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/translate.ts` | Pipeline principal |
| `scripts/translate-hook.ts` | Wrapper que chama o pipeline (convenience) |

## Custo Estimado

O Gemini 2.0 Flash tem pricing favorável para tradução:
- ~950 chaves = ~5000 tokens de input
- Cada execução completa custa ~$0.01 USD
- Execuções incrementais (poucas chaves novas) custam frações de centavo
