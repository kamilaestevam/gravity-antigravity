# Pesquisa de Mercado — NF de Entrada de Importacao

> **Agente:** Pesquisador de Mercado (Dream Team de Produtos)
> **Data:** 2026-03-30
> **Produto:** NF Importacao (Nota Fiscal de Entrada para Importacoes)
> **Versao:** 1.0

---

## Executive Summary

O mercado brasileiro de software COMEX esta em transformacao acelerada impulsionada por tres forcas: (1) a migracao obrigatoria para DUIMP, que invalida workflows legados baseados em XML da DI; (2) a adocao de IA para leitura documental e automacao; (3) a demanda por integracoes API-first com ERPs (SAP, TOTVS, Senior). Identificamos **10+ concorrentes** que atuam em alguma parte do fluxo de NF de Entrada, mas **nenhum oferece o pacote completo** de: geracao de NF a partir de DUIMP + rateio flexivel com 9 metodos + exportacao multi-formato customizavel + layout editavel pelo usuario. Este e o gap central que o Gravity NF Importacao deve explorar.

**Dados-chave:**
- 60.115 empresas importadoras ativas no Brasil (2025, +7,6% YoY) -- fonte MDIC
- ~29.800 empresas exportadoras (2025, recorde historico)
- Software COMEX e um mercado fragmentado, sem lider dominante no nicho especifico de NF de Entrada
- A transicao DI -> DUIMP cria janela de oportunidade de 12-18 meses (2026-2027)

---

## Classificacao de Qualidade dos Dados

| Simbolo | Significado |
|---------|-------------|
| ALTA | Fonte oficial, recente (< 1 ano), verificavel |
| MEDIA | Fonte confiavel, 1-2 anos, sem contradicao |
| BAIXA | Fonte secundaria, inferencia de multiplas fontes |
| HIPOTESE | Estimativa do pesquisador baseada em cruzamento de dados |

---

## 1. Fichas de Concorrentes

### 1.1 Logcomex

| Campo | Valor |
|:---|:---|
| **Site** | https://www.logcomex.com/ |
| **Fundacao** | ~2016, Curitiba-PR |
| **Funding** | Serie B: US$ 32,5M (nov/2023, Riverwood Capital). Total: US$ 43,4M em 5 rodadas [ALTA] |
| **Segmento** | SaaS - Big Data e IA para COMEX |
| **Clientes** | Portos, aeroportos, operadores logisticos, importadores |

**Proposta de Valor:** Inteligencia de dados e automacao para simplificar operacoes de comercio exterior, com rastreamento de cargas em tempo real e APIs para o Novo Processo de Importacao (DUIMP).

**NF de Entrada a partir de DUIMP:** NAO diretamente. A Logcomex foca em *data intelligence* e *follow-up* de cargas, nao em composicao de NF de Entrada. Desenvolveu API especifica para DUIMP, mas para consulta e rastreamento, nao para geracao de NF. [MEDIA]

**Rateio de despesas:** NAO possui modulo de rateio de despesas para NF de Entrada. [MEDIA]

**Formatos de exportacao:** N/A (nao gera NF).

**Pricing:** Nao divulgado publicamente. Modelo SaaS por assinatura. [BAIXA]

**Pontos Fortes:**
1. Maior startup de COMEX do Brasil em funding (US$ 43M+) [ALTA]
2. API robusta para DUIMP/Portal Unico [MEDIA]
3. Rastreamento de cargas em tempo real integrado com armadores e Siscomex [ALTA]
4. Blog com conteudo educacional forte (SEO dominante em termos COMEX) [ALTA]

**Pontos Fracos:**
1. NAO gera NF de Entrada — gap critico para nosso segmento [MEDIA]
2. Foco em big data/analytics, nao em operacao fiscal [MEDIA]
3. Poucos dados no Reclame Aqui (empresa B2B, pouca visibilidade consumer) [BAIXA]

**Risco para Gravity:** BAIXO no curto prazo (nao compete diretamente em NF de Entrada). MEDIO no longo prazo — pode expandir para composicao fiscal dado seu acesso a dados DUIMP.

**Fontes:**
- https://www.logcomex.com/
- https://blog.logcomex.com/duimp/cronograma
- https://neofeed.com.br/startups/riverwood-capital-embarca-na-logcomex-com-aporte-de-r-165-milhoes/

---

### 1.2 Conexos Cloud

| Campo | Valor |
|:---|:---|
| **Site** | https://conexoscloud.com.br/ |
| **Fundacao** | 1998 (como Conexos); software COMEX desde 2001; cloud desde 2017 |
| **Sede** | Vitoria-ES |
| **Aquisicao** | Integrada a NTT DATA em 2023 [ALTA] |
| **Segmento** | SaaS - ERP completo para COMEX |
| **Publico** | Trading Companies, Despachantes, Distribuidoras, Industrias |

**Proposta de Valor:** Software de gestao em nuvem com banco de dados unificado e integracao nativa entre modulos para todo o ciclo COMEX.

**NF de Entrada a partir de DUIMP:** SIM. O Conexos Cloud permite emissao de NF a partir da DI/DUIMP com dados ja integrados no sistema, incluindo transmissao automatica para Sefaz e anexacao do DANFE. [ALTA]

**Rateio de despesas:** PARCIAL. Possui modulo de custos de importacao com consolidacao, mas detalhes sobre metodos de rateio (peso, valor, igualitario etc.) nao sao explicitados publicamente. Provavelmente limitado a metodos basicos. [BAIXA]

**Formatos de exportacao:** Integracao com SAP declarada (parceria Conexos Cloud + SAP). Outros formatos nao confirmados publicamente. [MEDIA]

**Pricing:** Nao divulgado. Modelo sob consulta. Contato: (27) 3223-3288. [BAIXA]

**Pontos Fortes:**
1. 25+ anos de mercado — maturidade e base instalada [ALTA]
2. Plataforma 100% web e multi-idioma desde 2017 [ALTA]
3. Integracao com NTT DATA traz escala global e credibilidade enterprise [ALTA]
4. Robos integradores com Siscomex Web [MEDIA]
5. Blog forte em conteudo NF de importacao (SEO competitivo) [ALTA]

**Pontos Fracos:**
1. UX legada — interface corporativa tradicional, nao moderna [HIPOTESE]
2. Rateio de despesas provavelmente basico (sem 9 metodos flexiveis) [HIPOTESE]
3. Sem layout de exportacao customizavel pelo usuario [HIPOTESE]
4. Poucas reclamacoes no Reclame Aqui (< 10), mas tambem sem reputacao calculada [MEDIA]

**Risco para Gravity:** ALTO. Concorrente direto com NF de Entrada + integracao COMEX completa. Porem, gap em UX moderna e rateio flexivel pode ser explorado.

**Fontes:**
- https://conexoscloud.com.br/empresa/
- https://conexoscloud.com.br/como-preencher-corretamente-a-nota-fiscal-de-importacao/
- https://conexoscloud.com.br/sap-conexos-cloud-gestao-comercio-exterior/
- https://conexoscloud.com.br/tempo/

---

### 1.3 Softway / ONESOURCE Global Trade (Thomson Reuters)

| Campo | Valor |
|:---|:---|
| **Site** | https://www.thomsonreuters.com.br/pt/tax-accounting/comercio-exterior/ |
| **Fundacao** | Softway: 1996, Campinas-SP. Adquirida pela Thomson Reuters em 2013 |
| **Marca atual** | ONESOURCE Global Trade (Powered by Softway) |
| **Clientes** | ~1.200 clientes, 400+ grupos economicos. Setores: aeroespacial, agro, automotivo, O&G [ALTA] |
| **Segmento** | Enterprise - on-premise/cloud hibrido |

**Proposta de Valor:** Suite completa de COMEX enterprise com compliance regulatorio, classificacao de mercadorias e integracao certificada com SAP.

**NF de Entrada a partir de DUIMP:** SIM. Suporta geracao de NF a partir de declaracao de importacao. Integracao com Portal Unico. [MEDIA]

**Rateio de despesas:** SIM. Permite personalizar formulas de calculo de despesas, com flexibilidade para criar formulas customizadas. [ALTA]

**Formatos de exportacao:** Integracao certificada com SAP ECC e S4/HANA. Tambem suporta Oracle e TOTVS com pacotes homologados. Cloud incluso. [ALTA]

**Pricing:** Enterprise — sob consulta. Estimativa: R$ 5.000-50.000/mes dependendo de modulos e porte. [HIPOTESE]

**Pontos Fortes:**
1. Marca Thomson Reuters — credibilidade maxima no enterprise [ALTA]
2. Integracao SAP certificada (unico no mercado com certificacao oficial) [ALTA]
3. 29,1% das 250 maiores importadoras do Brasil usam Softway [ALTA]
4. Formulas customizaveis de rateio de despesas [ALTA]
5. Compliance e base regulatoria (COMEXDATA, legislacao integrada) [ALTA]

**Pontos Fracos:**
1. Preco enterprise inacessivel para PMEs [MEDIA]
2. UX datada — interface desktop/web hibrida [MEDIA]
3. SAP GTS Brasil em modo de manutencao (sem successor direto) [ALTA]
4. Implementacao longa e complexa (meses) [MEDIA]
5. Lock-in — migracao para fora e cara e dificil [HIPOTESE]

**Risco para Gravity:** MEDIO. Nao compete no segmento PME. Gravity pode capturar empresas que nao tem budget para ONESOURCE mas precisam de rateio flexivel.

**Fontes:**
- https://www.thomsonreuters.com.br/pt/tax-accounting/comercio-exterior/onesource-global-trade/importacao.html
- https://www.thomsonreuters.com.br/pt/tax-accounting/comercio-exterior/onesource-global-trade/integracao-erp.html
- https://en.adejo.com.br/solucoes-comex
- https://logweb.com.br/pequenos-e-medios-exportadores-sao-o-novo-alvo-da-softwaysoftcomex/

---

### 1.4 TOTVS Protheus (Modulo COMEX)

| Campo | Valor |
|:---|:---|
| **Site** | https://www.totvs.com/ |
| **Modulo** | SIGACOM — Comercio Exterior (dentro do ERP Protheus) |
| **Segmento** | ERP enterprise/mid-market |
| **Market share ERP Brasil** | ~50% do mercado brasileiro de ERP [ALTA] |

**Proposta de Valor:** Modulo COMEX integrado ao ERP Protheus, gerenciando todo o ciclo de importacao dentro do mesmo sistema contabil/fiscal.

**NF de Entrada a partir de DUIMP:** SIM. Rotina MATA103 para inclusao de NF de Importacao pelo Documento de Entrada. Suporte a DI e em transicao para DUIMP. [ALTA]

**Rateio de despesas:** SIM. Rotina MATA119 (Despesas de Importacao) faz rateio automatico entre produtos da nota de origem, proporcional ao valor de compra de cada produto. Permite estorno e re-rateio. [ALTA]

**Formatos de exportacao:** Nativo — gera NF dentro do proprio ERP. Exportacao limitada ao formato Protheus. [MEDIA]

**Pricing:** Licenca ERP Protheus: R$ 500-5.000+/usuario/mes (depende de modulos). COMEX e modulo adicional. [HIPOTESE]

**Pontos Fortes:**
1. Integrado ao ERP mais usado do Brasil [ALTA]
2. Rateio de despesas automatico e proporcional [ALTA]
3. Compliance fiscal nativo (SPED, NF-e) [ALTA]
4. Base instalada enorme — milhares de empresas [ALTA]

**Pontos Fracos:**
1. UX extremamente complexa e datada [ALTA]
2. Rateio limitado — apenas proporcional ao valor (nao tem 9 metodos) [MEDIA]
3. Depende de ter Protheus completo — nao vende modulo avulso [ALTA]
4. Customizacao cara (consultoria TOTVS ou parceiros) [ALTA]
5. Curva de aprendizado longa [ALTA]
6. Ajustes no rateio de despesas base ICMS e taxa Siscomex reportados como problematicos (TDN) [ALTA]

**Risco para Gravity:** MEDIO-ALTO. Empresas que ja tem Protheus usarao o modulo COMEX nativo. Gravity deve mirar empresas SEM Protheus ou insatisfeitas com a UX/limitacoes do rateio.

**Fontes:**
- https://centraldeatendimento.totvs.com/hc/pt-br/articles/360024679951
- https://centraldeatendimento.totvs.com/hc/pt-br/articles/360016589071
- https://tdn.totvs.com/pages/releaseview.action?pageId=244937281
- https://treinamentos.totvs.com/bits/produto/totvs-manufatura-linha-protheus-comex-importacao

---

### 1.5 SAP GTS (Global Trade Services)

| Campo | Valor |
|:---|:---|
| **Site** | https://help.sap.com/docs/SAP_GLOBAL_TRADE_SERVICES |
| **Status Brasil** | Localizacao em MODO DE MANUTENCAO — sem successor direto [ALTA] |
| **Segmento** | Enterprise global |

**Proposta de Valor:** Gestao de comercio exterior global integrada ao SAP S/4HANA, com compliance, classificacao de mercadorias e automacao de declaracoes.

**NF de Entrada a partir de DUIMP:** SIM (parcial). Gera NF de importacao a partir da declaracao aduaneira integrada com S/4HANA. Porem, com GTS Brasil em manutencao, novas funcionalidades para DUIMP dependem de parceiros como Thomson Reuters/Softway. [ALTA]

**Rateio de despesas:** Dentro do SAP MM/FI, nao no GTS especificamente. Rateio via customizacao ABAP. [MEDIA]

**Formatos de exportacao:** Formato SAP IDOC nativo. Integracao com NF-e brasileira via SAP Document Compliance. [ALTA]

**Pricing:** Licenca SAP S/4HANA: US$ 50.000-500.000+ (implementacao). GTS e add-on adicional. [HIPOTESE]

**Pontos Fortes:**
1. Integrado ao SAP — padrao em multinacionais [ALTA]
2. Compliance global (nao apenas Brasil) [ALTA]
3. Robusto para alto volume de transacoes [MEDIA]

**Pontos Fracos:**
1. Brasil em MODO DE MANUTENCAO — risco de descontinuacao [ALTA]
2. Custo proibitivo para 95% das empresas brasileiras [ALTA]
3. Implementacao de 6-18 meses [ALTA]
4. Depende de consultoria especializada para qualquer ajuste [ALTA]
5. Nao adaptado nativamente ao novo modelo DUIMP [MEDIA]

**Risco para Gravity:** BAIXO. SAP GTS nao compete com SaaS moderno acessivel. Gravity pode se posicionar como **complemento** ao SAP: ferramenta especializada que exporta em formato SAP IDOC.

**Fontes:**
- https://blogs.sap.com/2023/07/04/sap-gts-simplificando-o-comercio-exterior-no-brasil/
- https://answers.sap.com/questions/6297345/processo-de-importacao-nf-e-de-entrada.html
- https://community.sap.com/t5/financial-management-q-a/sap-gts-brazil/qaq-p/12721657

---

### 1.6 Narwal Sistemas

| Campo | Valor |
|:---|:---|
| **Site** | https://www.narwalsistemas.com.br/ |
| **Fundacao** | ~2013 (11 anos de experiencia declarados) |
| **Parceria** | Senior Sistemas (distribuicao via Senior Store) |
| **Clientes** | 1.250+ empresas (Natura, Braskem, Fujifilm) [ALTA] |
| **Segmento** | SaaS mid-market para COMEX |
| **Presenca** | 5+ paises [MEDIA] |

**Proposta de Valor:** Maior software de gestao COMEX do Brasil, com IA embarcada para catalogo de produtos, auditoria de despesas e DUIMP integrada ao Portal Unico.

**NF de Entrada a partir de DUIMP:** SIM. Emissao de DUIMP integrada ao Portal Unico. NF de importacao "em ate 2 cliques". [MEDIA — marketing, nao verificado]

**Rateio de despesas:** SIM. Controle de rateio de despesas mencionado nas funcionalidades. Auditoria de despesas via IA. Detalhes dos metodos nao divulgados. [BAIXA]

**Formatos de exportacao:** Integracao com ERPs: Senior, SAP, Sankhya e outros. [ALTA]

**Pricing:** Nao divulgado. Disponivel via Senior Store (marketplace). [BAIXA]

**Pontos Fortes:**
1. Maior base de clientes declarada em software COMEX Brasil (1.250+) [ALTA]
2. IA embarcada para catalogo NCM e auditoria de despesas [MEDIA]
3. DUIMP ja integrada [MEDIA]
4. Power BI dashboard integrado [MEDIA]
5. Multi-ERP (Senior, SAP, Sankhya) [ALTA]
6. Clientes de grande porte (Natura, Braskem) [ALTA]

**Pontos Fracos:**
1. Foco em gestao completa COMEX, nao em NF de Entrada especificamente [HIPOTESE]
2. Rateio de despesas provavelmente basico (sem 9 metodos documentados) [HIPOTESE]
3. Layout de exportacao customizavel nao mencionado [HIPOTESE]
4. Pode ser caro para PMEs [HIPOTESE]

**Risco para Gravity:** ALTO. Concorrente mais direto e maduro. Diferencial do Gravity deve ser: rateio com 9 metodos + layout customizavel + UX moderna + preco acessivel.

**Fontes:**
- https://www.narwalsistemas.com.br/importacao/
- https://www.narwalsistemas.com.br/clientes/
- https://www.narwalsistemas.com.br/solucoes/
- https://store.senior.com.br/loja/Narwal/produto/narwal-gestaocomex/gestao-de-comex-importacao-e-exportacao

---

### 1.7 Maino

| Campo | Valor |
|:---|:---|
| **Site** | https://www.maino.com.br/ |
| **Segmento** | SaaS - ERP especializado em importacao |
| **Publico** | PMEs importadoras e distribuidoras |
| **Capterra** | Listado com avaliacoes [MEDIA] |

**Proposta de Valor:** ERP especializado em importacao que integra NF-e, estoque, compras e financeiro em unica plataforma, com emissao de NF de importacao via DUIMP em ate 2 minutos.

**NF de Entrada a partir de DUIMP:** SIM. Consulta via web services diretamente no Portal Unico, sem necessidade de XML. Emissao de NF-e de Importacao via DUIMP. [ALTA]

**Rateio de despesas:** SIM (basico). Calcula custos de importacao com rateio de frete por peso e taxas por valor. [MEDIA]

**Formatos de exportacao:** NF-e (XML padrao Sefaz). Outros formatos nao confirmados. [MEDIA]

**Pricing:** 3 planos — Maino ERP (mensalidade), Maino Flex (creditos avulsos, sem mensalidade), Maino Xpert (avancado). Valores nao divulgados. [MEDIA]

**Pontos Fortes:**
1. Unico com modelo "sem mensalidade" (Flex — paga por credito) [ALTA]
2. DUIMP nativa via web services (sem XML) [ALTA]
3. ERP completo para importador (fiscal + financeiro + estoque) [ALTA]
4. Blog educacional forte com planilhas e calculadoras gratuitas [ALTA]
5. UX mais moderna que concorrentes legados [MEDIA]

**Pontos Fracos:**
1. Rateio basico (peso e valor apenas) — sem metodos avancados [MEDIA]
2. Sem layout de exportacao customizavel para ERP [HIPOTESE]
3. Foco em PME — pode nao escalar para operacoes complexas [HIPOTESE]
4. Formato de saida limitado a NF-e padrao [MEDIA]

**Risco para Gravity:** MEDIO-ALTO. Compete diretamente no segmento PME com NF + DUIMP. Gravity deve superar em rateio flexivel e exportacao multi-formato.

**Fontes:**
- https://www.maino.com.br/modulos/nota-fiscal-de-importacao
- https://www.maino.com.br/solucoes/xpert
- https://ajuda.maino.com.br/pt-BR/articles/9922907-como-utilizar-a-duimp-pelo-maino
- https://blog.maino.com.br/nota-fiscal-de-importacao/

---

### 1.8 ComexNFe

| Campo | Valor |
|:---|:---|
| **Site** | https://comexnfe.com.br/ |
| **Segmento** | SaaS nichado — NF de importacao |
| **Publico** | Importadores que precisam emitir NF de entrada |

**Proposta de Valor:** Sistema especializado em emissao de NF-e de importacao a partir do XML da DI do Siscomex, com rateio automatico e controle de estoque.

**NF de Entrada a partir de DUIMP:** PARCIAL. Funciona com XML da DI. Adaptacao para DUIMP (que nao tem XML) nao confirmada. [BAIXA]

**Rateio de despesas:** SIM. "Unico sistema a efetuar o rateio das informacoes ja consolidadas na DI." Reconhece II, IPI, PIS, COFINS, taxa Siscomex, Marinha Mercante, Multas. [ALTA]

**Formatos de exportacao:** NF-e padrao Sefaz + controle de estoque. Sem exportacao para ERP. [MEDIA]

**Pricing:** Nao divulgado. [BAIXA]

**Pontos Fortes:**
1. Muito nichado — focado exatamente em NF de entrada de importacao [ALTA]
2. Rateio automatico a partir da DI [ALTA]
3. Reconhece todos os impostos e taxas automaticamente [ALTA]

**Pontos Fracos:**
1. Dependente de XML da DI — risco com migracao para DUIMP (sem XML) [ALTA]
2. Sem exportacao multi-formato (SAP, TOTVS, TXT) [MEDIA]
3. Sem layout customizavel [MEDIA]
4. Escala e manutencao desconhecidas (empresa pequena) [HIPOTESE]

**Risco para Gravity:** BAIXO-MEDIO. Concorrente direto mas vulneravel pela transicao DI->DUIMP. Gravity deve ser o "ComexNFe 2.0" — mesma especializacao, mas com DUIMP nativa + rateio flexivel + exportacao multi-formato.

**Fontes:**
- https://comexnfe.com.br/xml-siscomex-gera-nota-fiscal-de-entrada-nota-de-entrada
- https://comexnfe.com.br/controle-de-estoque-para-empresa-de-importacao

---

### 1.9 iData Software

| Campo | Valor |
|:---|:---|
| **Site** | http://www.idata.com.br/ |
| **Fundacao** | 2005 |
| **Segmento** | SaaS/on-premise para despachantes e agentes de carga |
| **Produto principal** | iLOG |

**Proposta de Valor:** Sistema completo para despachantes aduaneiros e agentes de carga, com registro de DI/DUE por robo ou XML, acompanhamento de desembaraco e preparacao de NF-e.

**NF de Entrada a partir de DUIMP:** SIM. Preparacao para emissao de NF-e de entrada via XML ou Excel. Registro de DI e LPCO. [MEDIA]

**Rateio de despesas:** Nao confirmado explicitamente. Oferece calculo de estimativa de custos com consulta automatica de NCM. [BAIXA]

**Formatos de exportacao:** XML e Excel para NF-e de entrada. [MEDIA]

**Pricing:** Nao divulgado. [BAIXA]

**Pontos Fortes:**
1. 20 anos de mercado [ALTA]
2. Forte entre despachantes e agentes de carga [MEDIA]
3. Multiplos relatorios operacionais e financeiros [MEDIA]

**Pontos Fracos:**
1. Interface aparentemente legada [HIPOTESE]
2. Foco em despachante, nao em importador direto [MEDIA]
3. Rateio de despesas nao e diferencial [HIPOTESE]

**Risco para Gravity:** BAIXO. Publico diferente (despachantes vs importadores).

**Fontes:**
- http://www.idata.com.br/
- https://idata.com.br/desembaraco-aduaneiro/

---

### 1.10 Siscomex Web / Portal Unico (Governo)

| Campo | Valor |
|:---|:---|
| **Site** | https://portalunico.siscomex.gov.br/ |
| **Tipo** | Plataforma governamental gratuita |
| **Operador** | Receita Federal / Serpro |

**Proposta de Valor:** Portal oficial para registro de DUIMP e operacoes de importacao/exportacao.

**NF de Entrada a partir de DUIMP:** NAO. O Portal Unico registra a DUIMP mas NAO gera NF de Entrada. A NF e responsabilidade do importador via seu sistema fiscal. [ALTA]

**Rateio de despesas:** NAO. [ALTA]

**Formatos de exportacao:** A DUIMP nao possui extrato em XML (diferente da DI antiga). Dados acessiveis via API/web services. [ALTA]

**Pontos Fortes:**
1. Unica fonte oficial de dados DUIMP [ALTA]
2. Gratuito [ALTA]
3. API disponivel para integracao [MEDIA]

**Pontos Fracos:**
1. NAO gera NF de Entrada [ALTA]
2. Interface governamental pouco intuitiva [ALTA]
3. DUIMP sem XML = obriga importador a buscar solucao externa [ALTA]
4. Instabilidades reportadas historicamente [MEDIA]

**Risco para Gravity:** NENHUM (complementar). O Portal Unico e a *fonte de dados*, nao um concorrente. Gravity deve integrar via API.

**Fontes:**
- https://portalunico.siscomex.gov.br/
- https://www.gov.br/siscomex/pt-br/programa-portal-unico/cronograma-de-ligamento-duimp
- https://www.fazcomex.com.br/npi/como-gerar-nota-fiscal-de-importacao-duimp/

---

### 1.11 Linker, Deskcomex e Altere

**Status:** Nao foram encontrados resultados significativos para estas tres empresas nas buscas realizadas. Possiveis explicacoes:

- **Linker COMEX:** Pode referir-se a "Linkmex" (https://www.linkmex.com.br/) — plataforma de gestao e automacao de importacao/exportacao. Sem dados suficientes para ficha completa. [BAIXA]
- **Deskcomex:** Nenhum resultado encontrado com este nome. Pode ser uma empresa local/regional sem presenca web significativa ou ter mudado de nome. [BAIXA]
- **Altere:** Nenhum resultado encontrado como software COMEX. "Alterdata" existe no segmento fiscal mas nao e especializado em COMEX. [BAIXA]

**Recomendacao:** Validar a existencia e relevancia destes players com o SME (Subject Matter Expert) do time.

---

## 2. Concorrentes Adicionais Identificados na Pesquisa

| Empresa | Relevancia | NF Entrada | Rateio |
|---------|-----------|------------|--------|
| **Staff Informatica (GECEX)** | Media | Sim | Basico |
| **Movere Software** | Media | Sim (via XML DI) | Nao confirmado |
| **Senior Sistemas** | Media (via Narwal) | Sim | Via Narwal |
| **Bluesoft ERP** | Baixa | Sim (modulo COMEX) | Basico |
| **eComex** | Media | Sim (IA + automacao) | Nao confirmado |
| **QuickComex** | Baixa | Foco em despachante | Nao confirmado |
| **DBM Sistemas** | Baixa | Sim | Nao confirmado |

---

## 3. Mapa Competitivo Consolidado

### Matriz de Posicionamento

|  | Preco Acessivel (PME) | Preco Enterprise |
|:---|:---|:---|
| **Escopo Amplo (ERP/COMEX completo)** | Maino, Conexos Cloud | TOTVS Protheus, SAP GTS, ONESOURCE |
| **Escopo Nichado (NF Entrada)** | ComexNFe, **Gravity** | (vazio — oportunidade) |

### Comparativo de Features (Heat Map)

| Feature | Gravity | Conexos | ONESOURCE | TOTVS | Narwal | Maino | ComexNFe |
|:---|:---|:---|:---|:---|:---|:---|:---|
| NF Entrada via DUIMP | PLANEJADO | SIM | SIM | PARCIAL | SIM | SIM | NAO (XML DI) |
| Rateio 9 metodos | PLANEJADO | BASICO | CUSTOMIZAVEL | BASICO | BASICO | BASICO | AUTOMATICO |
| Layout exportacao customizavel | PLANEJADO | NAO | NAO | NAO | NAO | NAO | NAO |
| Exportacao SAP IDOC | PLANEJADO | PARCIAL | CERTIFICADO | NATIVO | VIA INTEGRACAO | NAO | NAO |
| Exportacao TOTVS | PLANEJADO | NAO | SIM | NATIVO | VIA INTEGRACAO | NAO | NAO |
| Exportacao Excel/CSV | PLANEJADO | PROVAVEL | SIM | SIM | SIM | PROVAVEL | NAO |
| Exportacao TXT posicao fixa | PLANEJADO | NAO | NAO | NAO | NAO | NAO | NAO |
| Smart Read (IA recibos) | PLANEJADO | NAO | NAO | NAO | SIM (auditoria) | NAO | NAO |
| Catalogo despesas livre | PLANEJADO | NAO CONFIRMADO | NAO CONFIRMADO | FIXO | NAO CONFIRMADO | NAO CONFIRMADO | NAO |
| Template de despesas | PLANEJADO | NAO | NAO | NAO | NAO | NAO | NAO |
| Favoritos fiscais (NCM) | PLANEJADO | NAO | NAO CONFIRMADO | NAO | NAO | NAO | NAO |
| Multi-empresa (company_id) | PLANEJADO | SIM | SIM | SIM | SIM | NAO CONFIRMADO | NAO CONFIRMADO |
| UX moderna (dark mode) | PLANEJADO | NAO | NAO | NAO | NAO | PARCIAL | NAO |
| API-first | PLANEJADO | NAO | NAO | NAO | NAO | NAO | NAO |
| Preco acessivel PME | PLANEJADO | MEDIO | ALTO | ALTO | MEDIO | ACESSIVEL | ACESSIVEL |

**Legenda:** SIM = implementado e funcional | BASICO = funcionalidade limitada | PARCIAL = em transicao | PLANEJADO = roadmap Gravity | NAO = ausente/nao confirmado

### Gap Analysis

| Gap Identificado | Quem tem | Quem NAO tem | Oportunidade Gravity |
|:---|:---|:---|:---|
| Rateio com 9 metodos (peso, valor, CIF, FOB, qty, II, igualitario, manual, customizado) | Ninguem completo | Todos (max 2-3 metodos) | **ALTA — diferencial exclusivo** |
| Layout de exportacao customizavel pelo usuario | Ninguem | Todos | **ALTA — diferencial exclusivo** |
| Exportacao TXT posicao fixa para ERPs legados | Ninguem em SaaS | Todos | **ALTA — nicho nao atendido** |
| NF Entrada via DUIMP nativa (sem XML) | Maino, Narwal | ComexNFe, muitos legados | **ALTA — janela temporal** |
| Smart Read de recibos com IA | Narwal (parcial) | Maioria | **MEDIA — diferencial tech** |
| Template de despesas por empresa | Ninguem | Todos | **MEDIA — produtividade** |
| Favoritos fiscais (CFOP+CSTs por NCM) | Ninguem | Todos | **MEDIA — produtividade** |
| Dark mode / UX moderna | Ninguem no COMEX | Todos | **MEDIA — diferencial UX** |
| API-first (integracao bidirecional) | Ninguem em NF Entrada | Todos | **MEDIA-ALTA** |
| Modelo SaaS por transacao (sem mensalidade) | Maino (Flex) | Maioria | **MEDIA** |

---

## 4. Analise de Tendencias de Mercado

### Tendencia 1: Migracao Obrigatoria DI -> DUIMP

- **O que e:** A DUIMP (Declaracao Unica de Importacao) esta substituindo a DI em fases desde outubro/2024
- **Estagio:** Em crescimento acelerado (obrigatorio)
- **Cronograma:**
  - Out/2024: Modal maritimo [ALTA]
  - 1S/2025: Modal aereo + licenciamento + Drawback [ALTA]
  - 2S/2025: Modal terrestre + Zona Franca [ALTA]
  - Dez/2026: Ultimo prazo (deposito especial) [ALTA]
- **Impacto critico:** DUIMP NAO tem extrato XML (DI tinha). Sistemas que dependem de XML ficarao obsoletos.
- **Players adotando:** Maino, Narwal, Conexos ja integrados. ComexNFe vulneravel.
- **Impacto no Gravity:** FAVORAVEL — janela de 12-18 meses para capturar mercado migrando de DI para DUIMP
- **Recomendacao:** Lancar com DUIMP nativa desde o dia 1. Nao suportar XML da DI (legado).

**Fontes:**
- https://blog.logcomex.com/duimp/cronograma
- https://www.gov.br/siscomex/pt-br/programa-portal-unico/cronograma-de-ligamento-duimp
- https://www.fazcomex.com.br/npi/duimp-2025-veja-as-mudancas-e-faseamento-da-duimp/

---

### Tendencia 2: Inteligencia Documental com IA

- **O que e:** IA para leitura, validacao e preenchimento automatico de documentos COMEX (BL, Invoice, Packing List, declaracoes)
- **Estagio:** Emergente -> Crescimento
- **Evidencias:**
  - "Ate 40% das rotinas de comex ainda dependem de tarefas manuais" no Brasil [ALTA]
  - 9 milhoes de empresas no Brasil ja usam IA sistematicamente (AWS, 2025) [ALTA]
  - Narwal ja usa IA para catalogo NCM e auditoria de despesas [MEDIA]
  - Tendencia 2026: "IA elimina digitacao manual no comex" (CNDL/VarejoSA) [ALTA]
- **Impacto no Gravity:** Feature "Smart Read" de recibos/PDFs alinha perfeitamente com esta tendencia
- **Recomendacao:** Implementar Smart Read como diferencial de Fase 1. Expandir para leitura de DUIMP/BL em Fase 2.

**Fontes:**
- https://cndl.org.br/varejosa/tendencia-2026-ia-elimina-digitacao-manual-e-redefine-a-eficiencia-no-comex/
- https://comexdobrasil.com/as-tendencias-de-tecnologia-que-vao-acelerar-o-brasil-em-2026/

---

### Tendencia 3: API-First e Integracao com ERPs

- **O que e:** Demanda crescente por APIs que conectem sistemas COMEX com ERPs (SAP, TOTVS, Senior, Sankhya) automaticamente
- **Estagio:** Crescimento -> Madura
- **Evidencias:**
  - Logcomex lancou plataforma de APIs para COMEX [ALTA]
  - ONESOURCE tem integracao certificada SAP [ALTA]
  - Narwal integra com Senior, SAP, Sankhya [ALTA]
- **Impacto no Gravity:** Layout de exportacao customizavel + pre-sets SAP/TOTVS atende esta demanda
- **Recomendacao:** Exportar em formato nativo dos ERPs desde MVP. API bidirecional em Fase 2.

---

### Tendencia 4: Intelligent Process Automation (IPA)

- **O que e:** Evolucao do RPA com IA — sistemas que leem documentos, interpretam linguagem natural e executam acoes entre plataformas
- **Estagio:** Emergente
- **Evidencias:**
  - "IPA vai alem de bots que replicam cliques" [ALTA]
  - "Antes privilegio de grandes bancos, agora acessivel para medio porte via SaaS e low-code" [ALTA]
- **Impacto no Gravity:** Oportunidade de automatizar o fluxo DUIMP -> NF -> Exportacao ERP end-to-end
- **Recomendacao:** Observar. Implementar em Fase 3 como "auto-compose" (DUIMP automaticamente gera NF pronta).

---

### Tendencia 5: Reforma Tributaria Brasileira

- **O que e:** Nova legislacao tributaria que altera calculos de impostos (IBS, CBS substituindo ICMS, PIS, COFINS)
- **Estagio:** Regulamentacao em andamento (2025-2026)
- **Impacto no Gravity:** Motor de calculo fiscal deve ser flexivel para acomodar mudancas regulatorias
- **Recomendacao:** Arquitetura modular para regras fiscais. Nao hardcodar aliquotas.

**Fontes:**
- https://blog.logcomex.com/retrospectiva-do-comex-em-2025-o-ano-do-adeus-a-di-e-da-revolucao-tributaria

---

### Mapa de Maturidade de Tendencias

| Tendencia | Emergente | Crescimento | Madura | Declinio |
|:---|:---|:---|:---|:---|
| DUIMP obrigatoria | | <-- | | |
| IA documental | <-- | | | |
| API-first / integracao ERP | | | <-- | |
| IPA (automacao inteligente) | <-- | | | |
| Reforma tributaria | <-- | | | |
| XML da DI | | | | <-- |

---

## 5. Dados de Mercado (TAM/SAM/SOM)

### TAM — Total Addressable Market

| Metrica | Valor | Fonte |
|---------|-------|-------|
| Empresas importadoras ativas Brasil (2025) | 60.115 | MDIC [ALTA] |
| Crescimento YoY importadoras | +7,6% (4.238 novas) | MDIC [ALTA] |
| Empresas exportadoras Brasil (2025) | 29.818 (recorde) | MDIC [ALTA] |
| Mercado software Brasil (2024) | US$ 12,3 bilhoes | Grand View Research [ALTA] |
| CAGR software Brasil (2025-2030) | 10,6% | Grand View Research [ALTA] |

**Estimativa TAM software COMEX Brasil:**
- 60.115 importadoras + ~15.000 despachantes/agentes = ~75.000 empresas potenciais
- Se 50% usa algum software COMEX, ticket medio R$ 500/mes = R$ 225M/ano
- **TAM estimado: R$ 200-300M/ano** [HIPOTESE]

### SAM — Serviceable Addressable Market

- Empresas que especificamente precisam de NF de Entrada de importacao: ~60.000 (todas as importadoras)
- Excluindo as que usam ERP com modulo COMEX nativo (Protheus, SAP): ~40% = ~36.000
- Ticket medio R$ 300/mes (SaaS acessivel)
- **SAM estimado: R$ 130M/ano** [HIPOTESE]

### SOM — Serviceable Obtainable Market (12 meses)

- Meta realista Ano 1: 200-500 empresas
- Ticket medio R$ 300/mes
- **SOM estimado: R$ 720K - R$ 1,8M/ano** [HIPOTESE]

---

## 6. Recomendacoes Estrategicas

### Posicionamento Recomendado

**Gravity NF Importacao deve ser:** A ferramenta SaaS moderna, acessivel e especializada que faz o melhor rateio de despesas e a melhor exportacao multi-formato do mercado, nativamente integrada com DUIMP.

**Gravity NAO deve competir em:** ERP completo (TOTVS, SAP), gestao de todo o ciclo COMEX (Narwal, Conexos), nem em analytics/big data (Logcomex).

### Top 3 Diferenciais Defensaveis

1. **Rateio com 9 metodos + formula customizada** — nenhum concorrente oferece. E a maior dor do importador. Barreira: complexidade tecnica do motor de calculo.

2. **Layout de exportacao customizavel pelo usuario** — ninguem no mercado permite que o usuario monte seu proprio formato de saida (posicao de campos, codificacao, delimitador). Barreira: motor de templates flexivel.

3. **DUIMP-native + multi-formato num unico SaaS acessivel** — os que tem DUIMP sao caros (Narwal, Conexos, ONESOURCE). Os acessiveis (ComexNFe) dependem de XML legado. Gravity ocupa o espaco vazio entre eles.

### Riscos Competitivos

| Risco | Probabilidade | Impacto | Mitigacao |
|:---|:---|:---|:---|
| Narwal adiciona rateio avancado | Media | Alto | Lancar rapido, construir base antes |
| Maino expande motor de rateio | Media | Medio | Diferenciar com layout customizavel |
| TOTVS lanca modulo standalone | Baixa | Alto | Foco em UX e preco inacessivel TOTVS |
| Novo entrante com IA-first | Media | Medio | Implementar Smart Read cedo |
| Mudanca regulatoria inesperada | Media | Alto | Arquitetura fiscal modular |

### Acoes Imediatas

1. **Validar com 5-10 importadores reais** quais metodos de rateio usam e quais formatos de ERP precisam
2. **Priorizar pre-sets de exportacao** SAP IDOC e TOTVS Protheus (80% do mercado ERP)
3. **Publicar conteudo educacional** sobre "NF de Entrada com DUIMP" (competir em SEO com Conexos e Maino)
4. **Considerar modelo Flex** (pagamento por NF emitida) similar ao Maino para captura de PMEs
5. **Integrar via API do Portal Unico** para puxar dados DUIMP automaticamente (sem upload manual)

---

## 7. Fontes Consolidadas

### Fontes Primarias (sites oficiais)
- https://www.logcomex.com/
- https://conexoscloud.com.br/
- https://www.thomsonreuters.com.br/pt/tax-accounting/comercio-exterior/
- https://www.totvs.com/
- https://help.sap.com/docs/SAP_GLOBAL_TRADE_SERVICES
- https://www.narwalsistemas.com.br/
- https://www.maino.com.br/
- https://comexnfe.com.br/
- http://www.idata.com.br/
- https://portalunico.siscomex.gov.br/

### Fontes de Dados
- https://comexstat.mdic.gov.br/pt/geral (MDIC — dados oficiais de importadores)
- https://www.gov.br/secom/pt-br/acompanhe-a-secom/noticias/2026/03/ (29.818 exportadoras 2025)
- https://www.gov.br/siscomex/pt-br/programa-portal-unico/cronograma-de-ligamento-duimp

### Fontes de Tendencias
- https://cndl.org.br/varejosa/tendencia-2026-ia-elimina-digitacao-manual-e-redefine-a-eficiencia-no-comex/
- https://comexdobrasil.com/as-tendencias-de-tecnologia-que-vao-acelerar-o-brasil-em-2026/
- https://blog.logcomex.com/retrospectiva-do-comex-em-2025-o-ano-do-adeus-a-di-e-da-revolucao-tributaria

### Fontes de Funding
- https://neofeed.com.br/startups/riverwood-capital-embarca-na-logcomex-com-aporte-de-r-165-milhoes/

### Fontes Tecnicas
- https://centraldeatendimento.totvs.com/hc/pt-br/articles/360024679951 (TOTVS despesas importacao)
- https://tdn.totvs.com/pages/releaseview.action?pageId=244937281 (TOTVS rateio ajustes)
- https://blogs.sap.com/2023/07/04/sap-gts-simplificando-o-comercio-exterior-no-brasil/
- https://www.fazcomex.com.br/npi/como-gerar-nota-fiscal-de-importacao-duimp/
