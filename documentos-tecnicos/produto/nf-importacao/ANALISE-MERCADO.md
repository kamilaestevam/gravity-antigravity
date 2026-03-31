# Analise de Mercado -- NF de Entrada de Importacao

**Agente:** Data Analyst (Dream Team de Produtos)
**Data:** 2026-03-30
**Metodologia:** Top-down + Bottom-up
**Status:** Primeira versao -- dados em coleta continua

---

## 1. TAM (Total Addressable Market)

### 1.1 Empresas com RADAR Siscomex (habilitadas)

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Empresas importadoras ativas (2025) | 60.115 | MDIC/SECEX -- Relatorio Anual Comercio Exterior por Porte | 🟢 Alta |
| Empresas importadoras ativas (2024) | ~55.877 | Calculado: 60.115 / 1.076 (crescimento 7,6%) | 🟡 Media |
| Crescimento anual importadoras | +7,6% (4.238 novas empresas) | MDIC/SECEX 2025 | 🟢 Alta |
| Empresas exportadoras (2025) | 29.818 | MDIC -- Serie historica, mar/2026 | 🟢 Alta |
| Empresas exportadoras (2024) | 28.847 (recorde) | MDIC/Agencia Gov, mar/2025 | 🟢 Alta |

**Nota:** O numero de empresas habilitadas no RADAR e maior que o de importadoras ativas, pois inclui empresas que possuem habilitacao mas nao importam regularmente. Estimativa de empresas com RADAR ativo: ~80.000-90.000 (considerando que muitas obtem habilitacao mas nao operam regularmente).

**Fonte:** [MDIC -- Empresas Exportadoras 2025](https://www.gov.br/mdic/pt-br/assuntos/noticias/2026/03/brasil-chega-a-29-818-empresas-exportadoras-maior-numero-da-serie-historica) | [Agencia Gov -- Recorde 2024](https://agenciagov.ebc.com.br/noticias/202503/brasil-fecha-2024-com-recorde-de-28-847-empresas-exportadoras) | [ComexStat](https://comexstat.mdic.gov.br/pt/geral)

### 1.2 Declaracoes de Importacao (DI/DUIMP) por Ano

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Total DIs registradas (2023) | 2.567.205 | Balanco Aduaneiro 2023 -- Receita Federal | 🟢 Alta |
| Total DUIMPs registradas (2024) | ~2.956 (fase inicial) | Balanco Aduaneiro 2024 -- Receita Federal | 🟢 Alta |
| Total DIs + DUIMPs (2024 est.) | ~2.700.000 | Estimativa baseada em crescimento de 9% nas importacoes | 🟡 Media |
| Declaracoes de exportacao DU-E (2023) | 2.045.581 | Balanco Aduaneiro 2023 -- Receita Federal | 🟢 Alta |
| Total declaracoes comex (2023) | 4.544.620 | Balanco Aduaneiro 2023 -- Receita Federal | 🟢 Alta |

**Contexto DUIMP:** A DUIMP comecou implantacao obrigatoria em outubro/2024 (Fase 1 -- maritimo sem anuencia). Cronograma:
- Fase 1 (out-dez/2024): Modal maritimo sem anuencia
- Fase 2 (jan-mar/2025): Modal aereo + anuentes
- Fase 3 (jul-dez/2025): Modal terrestre + Zona Franca de Manaus
- Ate final de 2025/2026: 100% das operacoes via DUIMP

**Fonte:** [Balanco Aduaneiro 2023 -- Receita Federal](https://static.poder360.com.br/2024/05/Receita-Federal-Balanco-Aduaneiro-2023.pdf) | [Balanco Aduaneiro 2024 -- Receita Federal](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/relatorios/aduana/2024-balanco-aduaneiro.pdf)

### 1.3 NFs de Entrada Geradas por Importacao

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| NFs de entrada por ano (estimativa) | ~2.500.000 - 3.000.000 | Aproximadamente 1 NF por DI (pode haver mais de 1 NF por DI em casos de entrega parcial) | 🔴 Hipotese |
| NFs de entrada com multiplas adicoes | Maioria | Cada DI pode ter multiplas adicoes e cada adicao vira item da NF | 🟠 Baixa |

**Nota:** Nao existe estatistica oficial sobre NFs de entrada de importacao especificamente. O volume e proporcional ao numero de DIs/DUIMPs registradas, com relacao aproximada de 1:1.

### 1.4 Tamanho do Mercado de Software COMEX no Brasil

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Mercado total de software Brasil (2024) | USD 12,3 bilhoes | Grand View Research | 🟡 Media |
| Crescimento previsto software Brasil | CAGR 10,6% (2025-2030) | Grand View Research | 🟡 Media |
| Mercado TI Brasil total (2024) | USD 58,6 bilhoes | ABES -- Dados do Setor | 🟡 Media |
| Mercado software COMEX Brasil (est.) | R$ 1,5 - 2,5 bilhoes/ano | 🔴 Hipotese -- ver calculo abaixo | 🔴 Hipotese |

**Calculo bottom-up do mercado COMEX software:**
- ~60.000 empresas importadoras x ticket medio estimado R$ 2.000/mes = R$ 1,44 bi/ano
- ~30.000 empresas exportadoras (parcialmente sobrepostas) x R$ 1.500/mes = R$ 540 MM/ano
- ~5.000 despachantes/comissarias x R$ 3.000/mes = R$ 180 MM/ano
- **Total estimado: R$ 1,5 - 2,5 bilhoes/ano**

**Fonte:** [Grand View Research -- Brazil Software Market](https://www.grandviewresearch.com/horizon/outlook/software-market/brazil) | [ABES -- Dados do Setor](https://abes.org.br/en/dados-do-setor/)

### 1.5 Valor Total das Importacoes

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Importacoes Brasil (2024) | USD 262,5 bilhoes | Agencia Brasil / MDIC | 🟢 Alta |
| Importacoes Brasil (2025) | USD 280,4 bilhoes | CNN Brasil / MDIC | 🟢 Alta |
| Crescimento importacoes 2024->2025 | +6,8% | MDIC | 🟢 Alta |
| Superavit balanca comercial (2024) | USD 74,55 bilhoes | Agencia Brasil | 🟢 Alta |
| Superavit balanca comercial (2025) | USD 68,3 bilhoes | CNN Brasil | 🟢 Alta |

**Fonte:** [Agencia Brasil -- Balanca 2024](https://agenciabrasil.ebc.com.br/economia/noticia/2025-01/balanca-comercial-tem-superavit-de-us-7455-bilhoes-em-2024) | [CNN Brasil -- Balanca 2025](https://www.cnnbrasil.com.br/economia/macroeconomia/balanca-comercial-tem-superavit-de-us-683-bilhoes-em-2025-diz-governo/)

---

## 2. SAM (Serviceable Available Market)

### 2.1 Empresas que Importam Ativamente

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Empresas importadoras ativas (2025) | 60.115 | MDIC/SECEX | 🟢 Alta |
| Medias e grandes importadoras | Crescimento de 5,5% (+1.517) em 2025 | MDIC/SECEX | 🟢 Alta |
| Pequenas importadoras | Crescimento de 9,5% (+2.624) em 2025 | MDIC/SECEX | 🟢 Alta |
| Empresas que usam software de COMEX (est.) | ~25.000 - 35.000 (~50-60% das ativas) | 🔴 Hipotese | 🔴 Hipotese |
| Empresas que fazem manualmente (est.) | ~25.000 - 35.000 (~40-50% das ativas) | 🔴 Hipotese | 🔴 Hipotese |

**Nota:** Nao existe pesquisa publica sobre adocao de software COMEX no Brasil. A estimativa de 50-60% de adocao de software e baseada no fato de que: (a) empresas medias/grandes geralmente usam software, (b) pequenas importadoras frequentemente operam com planilhas ou dependem do despachante.

### 2.2 Despachantes Aduaneiros

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Despachantes aduaneiros registrados | ~11.000 | Receita Federal -- Cadastro Aduaneiro | 🟡 Media |
| Empresas de despacho aduaneiro | ~3.000 - 5.000 (est.) | 🔴 Hipotese -- varios profissionais por empresa | 🔴 Hipotese |

**Contexto:** O despachante aduaneiro e frequentemente quem emite a NF de entrada de importacao em nome do importador, ou fornece os dados para que o importador emita. Sao um publico-alvo critico para qualquer solucao de NF de importacao.

**Fonte:** [Receita Federal -- Despachante Aduaneiro](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/subportais-aduana-e-comercio-exterior/intervenientes/habilitacao-em-sistemas-aduaneiros/despachante-aduaneiro) | [ADAB -- Associacao dos Despachantes Aduaneiros](https://adabrasil.org.br/)

### 2.3 SAM Calculado para NF de Entrada de Importacao

**Publico-alvo primario:** Empresas que importam e precisam emitir NF de entrada
- ~60.000 importadoras ativas
- Menos: empresas que ja tem ERP com modulo COMEX integrado (~15.000-20.000 est.)
- **SAM estimado: ~35.000 - 45.000 empresas**

**Publico-alvo secundario:** Despachantes aduaneiros e assessorias de COMEX
- ~3.000 - 5.000 empresas de despacho

**Ticket medio mensal estimado:** R$ 500 - 2.000/mes (segmento NF de entrada especificamente)

**SAM em valor:** 40.000 empresas x R$ 1.000/mes x 12 = **R$ 480 MM/ano** 🔴 Hipotese

---

## 3. SOM (Serviceable Obtainable Market)

### 3.1 Penetracao Realista em 2 Anos

| Cenario | Clientes (24 meses) | Receita Mensal | ARR |
|:---|:---|:---|:---|
| Conservador | 100 empresas | R$ 100.000 | R$ 1,2 MM |
| Base | 300 empresas | R$ 375.000 | R$ 4,5 MM |
| Otimista | 700 empresas | R$ 875.000 | R$ 10,5 MM |

**Premissas:**
- Conversao de trial: 15-25% (benchmark SaaS B2B)
- Ciclo de venda: 30-90 dias (COMEX e processo critico, decisao rapida se resolver dor real)
- Churn mensal: 3-5% (ver benchmarks abaixo)
- Tempo de payback CAC: 6-12 meses

### 3.2 Analise de Preco (Price Point)

| Faixa | Perfil | Preco Sugerido | Justificativa |
|:---|:---|:---|:---|
| Starter | PMEs, <10 DIs/mes | R$ 199 - 499/mes | Entrada acessivel, compete com Gett NF-e (R$ 199/mes) |
| Pro | Medias, 10-100 DIs/mes | R$ 999 - 2.499/mes | Rateio automatico, multiplos usuarios |
| Enterprise | Grandes, >100 DIs/mes | R$ 5.000+/mes | API, integracao ERP, SLA |

**Referencia de concorrentes:**
| Concorrente | Preco | Fonte | Qualidade |
|:---|:---|:---|:---|
| Gett -- NF-e Importacao | a partir de R$ 199/mes | Senior Store | 🟢 Alta |
| Gett -- Gestao Comex completa | a partir de R$ 699/mes | Senior Store | 🟢 Alta |
| Narwal -- Gestao Comex | R$ 5.000/mes | Senior Store | 🟢 Alta |
| Conexos Cloud | Sob consulta (nao publicado) | Conexos website | 🟠 Baixa |
| Bysoft (WiseTech Global) | Sob consulta (nao publicado) | Bysoft website | 🟠 Baixa |

**Fonte:** [Gett -- Senior Store](https://store.senior.com.br/loja/gett/produto/gett-mensalidade-clientes-seniorx-a/software-para-geracao-da-nf-e-de-importacao-atraves-do-xml-da-di) | [Narwal -- Senior Store](https://store.senior.com.br/loja/Narwal/produto/narwal-gestaocomex/gestao-de-comex-importacao-e-exportacao)

---

## 4. Metricas de Volume

### 4.1 Adicoes por DI/DUIMP

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Media de adicoes por DI | 3 a 8 adicoes (variavel por setor) | 🔴 Hipotese -- experiencia de mercado, sem dado oficial | 🔴 Hipotese |
| DIs com adicao unica | ~30-40% (importacoes simples) | 🔴 Hipotese | 🔴 Hipotese |
| DIs com 10+ adicoes | ~10-15% (grandes importadores) | 🔴 Hipotese | 🔴 Hipotese |
| Taxa Siscomex por DI | R$ 185,00 + R$ 29,50/adicao | Receita Federal (legislacao vigente) | 🟢 Alta |

**Nota:** A Receita Federal cobra R$ 185,00 por DI + R$ 29,50 por adicao. Nao ha estatistica publica oficial sobre a media de adicoes por DI.

### 4.2 Despesas por NF de Entrada

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Tipos de despesas tipicas | 8 a 15 por processo | Pratica de mercado (comexblog, Maino) | 🟠 Baixa |
| Despesas obrigatorias comuns | II, IPI, PIS, COFINS, ICMS, Taxa Siscomex, AFRMM, armazenagem, frete, seguro | Legislacao tributaria | 🟢 Alta |
| Despesas que precisam rateio | Frete, seguro, AFRMM, armazenagem, capatazia, diferenca de peso | Pratica de mercado | 🟠 Baixa |

**Despesas tipicas de uma NF de Entrada de Importacao:**
1. II (Imposto de Importacao) -- por adicao
2. IPI -- por adicao
3. PIS-Importacao -- por adicao
4. COFINS-Importacao -- por adicao
5. ICMS -- por item
6. Taxa Siscomex -- rateada
7. AFRMM -- rateado
8. Frete internacional -- rateado
9. Seguro internacional -- rateado
10. Armazenagem -- rateada
11. Capatazia -- rateada
12. Despesas aduaneiras diversas -- rateadas
13. Diferenca de cambio (eventual)
14. Multas (eventual)

### 4.3 Tempo de Composicao da NF de Entrada

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Tempo manual (sem software) | 2 a 8 horas por NF (pode chegar a dias em casos complexos) | ComexBlog, Maino, depoimentos de mercado | 🟠 Baixa |
| Tempo com software basico | 30 min a 2 horas | Estimativa de mercado | 🔴 Hipotese |
| Tempo com automacao completa (XML DI) | < 5 minutos | Gett marketing materials | 🟡 Media |
| Reducao de tempo prometida (Gett) | Ate 95% do tempo da equipe | Gett website | 🟡 Media |
| Casos extremos manuais | > 1 semana tentando emitir | ComexBlog -- relatos de importadores | 🟠 Baixa |

**Insight critico:** A complexidade da NF de importacao e que os impostos precisam ser informados **item a item**, enquanto na DI eles vem **agrupados por adicao**. Essa divergencia de granularidade e a principal fonte de erros e retrabalho.

**Fonte:** [ComexBlog -- Calculando NF de Entrada](https://comexblog.com.br/importacao/calculando-uma-nf-de-entrada-na-importacao/) | [Maino -- NF-e de Importacao](https://blog.maino.com.br/calcular-nfe-de-importacao-como-seu-despachante/)

### 4.4 Taxa de Erro na Alocacao Manual de Despesas

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Taxa de erro em NFs manuais | 15-30% (estimativa de mercado) | 🔴 Hipotese baseada em depoimentos | 🔴 Hipotese |
| Erros mais comuns | Rateio incorreto de AFRMM, frete e armazenagem entre itens | Pratica de mercado | 🟠 Baixa |
| Consequencia de erros | Multas fiscais, glosas de credito de ICMS/PIS/COFINS, retrabalho | Legislacao tributaria | 🟢 Alta |
| Custo medio de um erro nao detectado | R$ 500 - R$ 50.000 (dependendo da operacao) | 🔴 Hipotese | 🔴 Hipotese |

**Tipos de erro mais frequentes:**
1. Valor aduaneiro calculado incorretamente (CIF vs FOB)
2. Rateio de frete/seguro desproporcional entre adicoes
3. AFRMM calculado sobre base errada
4. ICMS com base de calculo incorreta (inclusao/exclusao de despesas)
5. Diferenca de valores entre DI e NF (batimento nao fecha)
6. Classificacao fiscal (NCM) divergente entre DI e NF

---

## 5. Benchmarks da Industria

### 5.1 Pricing de SaaS COMEX no Brasil

| Solucao | Modelo de Cobranca | Preco | Fonte | Qualidade |
|:---|:---|:---|:---|:---|
| Gett (NF-e Importacao) | Por mes/licenca | a partir de R$ 199/mes | Senior Store | 🟢 Alta |
| Gett (Gestao Comex) | Por mes/licenca | a partir de R$ 699/mes | Senior Store | 🟢 Alta |
| Narwal (Gestao Comex) | Por mes | R$ 5.000/mes | Senior Store | 🟢 Alta |
| Conexos Cloud | Modular, sob consulta | Nao publicado | Website | 🟠 Baixa |
| Bysoft/iGlobal (WiseTech) | Sob consulta | Nao publicado | Website | 🟠 Baixa |
| Thomson Reuters ONESOURCE | Enterprise, sob consulta | Nao publicado | Website | 🟠 Baixa |
| Logcomex | SaaS, sob consulta | Nao publicado (foco inteligencia, nao operacional) | Website | 🟠 Baixa |
| ComexNFe | Por processo | Nao publicado | Website | 🟠 Baixa |
| Maino | SaaS | Nao publicado | Website | 🟠 Baixa |

**Observacao:** O mercado de software COMEX no Brasil e fragmentado e a maioria dos fornecedores nao publica precos. O modelo de cobranca varia entre por usuario, por processo/DI, mensal fixo, e por modulo.

**Faixa de mercado estimada:** R$ 199/mes (entrada, NF apenas) ate R$ 10.000+/mes (enterprise, suite completa). 🟡 Media

### 5.2 NPS Benchmarks para Software COMEX

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| NPS medio SaaS B2B (global) | 36-41 | Retently 2025, Userpilot 2024 | 🟡 Media |
| NPS medio SaaS B2B Brasil | Sem dado especifico disponivel | -- | 🔴 Hipotese |
| NPS software COMEX Brasil | Sem dado publicado | -- | 🔴 Hipotese |
| NPS "bom" para nicho vertical | >40 | Benchmark global SaaS | 🟡 Media |
| NPS "excelente" | >50 | Benchmark global SaaS | 🟡 Media |

**Nota:** Nao existe benchmark publico de NPS especificamente para software de comercio exterior no Brasil. A referencia global de SaaS B2B e o melhor proxy disponivel.

**Fonte:** [Vitally -- SaaS Churn Benchmarks 2025](https://www.vitally.io/post/saas-churn-benchmarks) | [ChurnWard -- NPS Score SaaS](https://churnward.com/blog/what-is-a-good-nps-score/)

### 5.3 Churn Rates para SaaS B2B

| Metrica | Valor | Fonte | Qualidade |
|:---|:---|:---|:---|
| Churn medio mensal SaaS B2B (global) | 3,5% | HubiFi / Lighter Capital 2025 | 🟡 Media |
| Churn SMB SaaS | 3-5% mensal | Lighter Capital 2025 | 🟡 Media |
| Churn Mid-Market SaaS | 1,5-3% mensal | Lighter Capital 2025 | 🟡 Media |
| Churn Enterprise SaaS | 1-2% mensal | Lighter Capital 2025 | 🟡 Media |
| Churn anual saudavel (meta) | <5% | Benchmark global | 🟡 Media |
| NRR (Net Revenue Retention) B2B SaaS | 97-118% (mediana ~100%) | Optifai -- 939 companies | 🟡 Media |

**Implicacao para Gravity:** Software COMEX tende a ter switching costs altos (integracao com ERP, curva de aprendizado fiscal). Isso sugere churn potencialmente mais baixo que a media SaaS, desde que o produto entregue valor rapidamente.

**Fonte:** [Lighter Capital -- 2025 B2B SaaS Benchmarks](https://www.lightercapital.com/blog/2025-b2b-saas-startup-benchmarks) | [Maxio -- 2025 SaaS Benchmarks Report](https://www.maxio.com/resources/2025-saas-benchmarks-report)

---

## 6. Concorrentes Identificados

| Concorrente | Tipo | Foco | Diferencial | Grupo/Funding |
|:---|:---|:---|:---|:---|
| Gett | SaaS | NF-e importacao + Gestao Comex | Especialista em NF de importacao via XML da DI | Independente (desde 2008) |
| Narwal | SaaS | Gestao Comex completa | Suite completa, IA, parceiro Senior | Independente |
| Conexos Cloud | SaaS | Gestao Comex completa | Agora parte da NTT DATA | NTT DATA |
| Bysoft/iGlobal | SaaS | Gestao Comex + Logistica | Parte do WiseTech Global (ASX listada) | WiseTech Global (desde 2017) |
| Thomson Reuters ONESOURCE | Enterprise | Compliance fiscal + Comex | Referencia global em compliance | Thomson Reuters |
| Logcomex | SaaS | Inteligencia de mercado COMEX | Dados e analytics, nao operacional | VC-backed (Curitiba) |
| Maino | SaaS | Emissao NFe + COMEX | Simplificacao da NF de importacao | Independente |
| ComexNFe | SaaS | NF de entrada especifica | Foco exclusivo em NF de importacao via Siscomex Web | Independente |

---

## 7. Resumo Executivo e Principais Insights

### Numeros-Chave

| Dado | Valor | Confianca |
|:---|:---|:---|
| Empresas importadoras ativas no Brasil | 60.115 (2025) | 🟢 |
| DIs registradas por ano | ~2,6 milhoes (2023) | 🟢 |
| Valor das importacoes | USD 280 bilhoes (2025) | 🟢 |
| Despachantes aduaneiros registrados | ~11.000 | 🟡 |
| SAM (empresas sem software adequado) | ~35.000 - 45.000 | 🔴 |
| TAM software COMEX Brasil | R$ 1,5 - 2,5 bi/ano | 🔴 |
| Tempo manual NF de entrada | 2-8 horas | 🟠 |
| Reducao com automacao | >95% | 🟡 |

### Insights para Decisao de Produto

1. **Mercado grande e crescente:** 60k+ importadoras ativas, crescendo 7,6% ao ano. A transicao DI -> DUIMP cria momento de mudanca de ferramentas.

2. **Dor real e quantificavel:** Composicao manual de NF de importacao leva horas e tem alta taxa de erro. O rateio de despesas entre adicoes e o ponto mais critico.

3. **Fragmentacao de concorrentes:** Mercado sem lider claro no nicho especifico de NF de entrada. Gett e o mais proximo, mas cobra a partir de R$ 199/mes por uma funcionalidade basica.

4. **Momento de transicao (DUIMP):** A migracao obrigatoria para DUIMP (2024-2026) obriga todas as empresas a revisar seus processos. E uma janela de oportunidade para novas ferramentas.

5. **Switching costs altos:** Uma vez adotada, a ferramenta COMEX tem alta retencao (integracao ERP, curva fiscal). O desafio e a aquisicao, nao a retencao.

6. **Dados oficiais escassos sobre adocao de software:** Nao ha pesquisa publica sobre % de empresas que usam software COMEX vs manual/planilha. Esta e uma lacuna de dados importante.

### Lacunas de Dados (a investigar)

- [ ] Numero exato de empresas habilitadas no RADAR (vs importadoras ativas)
- [ ] Total de DIs/DUIMPs registradas em 2024 e 2025 (aguardar Balanco Aduaneiro)
- [ ] Media de adicoes por DI (dado granular nao publicado)
- [ ] Taxa real de adocao de software COMEX entre importadoras
- [ ] NPS e churn especificos de software COMEX no Brasil
- [ ] Market share dos concorrentes
- [ ] Preco medio praticado por Conexos e Bysoft

---

## Fontes Principais

- [ComexStat -- MDIC](https://comexstat.mdic.gov.br/pt/geral)
- [Balanco Aduaneiro 2024 -- Receita Federal](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/relatorios/aduana/2024-balanco-aduaneiro.pdf)
- [Balanco Aduaneiro 2023 -- Receita Federal](https://static.poder360.com.br/2024/05/Receita-Federal-Balanco-Aduaneiro-2023.pdf)
- [MDIC -- Empresas Exportadoras](https://www.gov.br/mdic/pt-br/assuntos/noticias/2026/03/brasil-chega-a-29-818-empresas-exportadoras-maior-numero-da-serie-historica)
- [Agencia Brasil -- Balanca Comercial 2024](https://agenciabrasil.ebc.com.br/economia/noticia/2025-01/balanca-comercial-tem-superavit-de-us-7455-bilhoes-em-2024)
- [CNN Brasil -- Balanca Comercial 2025](https://www.cnnbrasil.com.br/economia/macroeconomia/balanca-comercial-tem-superavit-de-us-683-bilhoes-em-2025-diz-governo/)
- [Receita Federal -- Despachante Aduaneiro](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/subportais-aduana-e-comercio-exterior/intervenientes/habilitacao-em-sistemas-aduaneiros/despachante-aduaneiro)
- [Senior Store -- Gett](https://store.senior.com.br/loja/gett/)
- [Senior Store -- Narwal](https://store.senior.com.br/loja/Narwal/produto/narwal-gestaocomex/gestao-de-comex-importacao-e-exportacao)
- [Lighter Capital -- 2025 B2B SaaS Benchmarks](https://www.lightercapital.com/blog/2025-b2b-saas-startup-benchmarks)
- [Vitally -- SaaS Churn Benchmarks 2025](https://www.vitally.io/post/saas-churn-benchmarks)
- [Grand View Research -- Brazil Software Market](https://www.grandviewresearch.com/horizon/outlook/software-market/brazil)
- [ComexBlog -- NF de Entrada](https://comexblog.com.br/importacao/calculando-uma-nf-de-entrada-na-importacao/)
- [Maino -- NF-e de Importacao](https://blog.maino.com.br/calcular-nfe-de-importacao-como-seu-despachante/)
