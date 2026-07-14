#!/usr/bin/env python3
"""Gera matriz-validacao-pedido-compra/venda-smart-read.ts a partir dos dados do PDF."""

import json

def motor(m: str) -> str:
    m = m.lower().replace('ia (llm)', 'llm').replace('code', 'codigo')
    if 'cross-doc + rag' in m or 'cross_doc + rag' in m:
        return 'cross_doc_rag'
    if 'llm + api' in m or 'ia (llm) + api' in m:
        return 'api_llm'
    if 'cross-doc' in m or 'cross_doc' in m:
        return 'cross_doc'
    if 'código' in m or 'codigo' in m:
        return 'codigo'
    if 'llm' in m:
        return 'llm'
    if 'api' in m:
        return 'api'
    if 'rag' in m:
        return 'rag'
    return 'codigo'


def sev(s: str | None) -> str | None:
    if not s:
        return None
    s = s.upper().strip()
    return {'BLOQ': 'bloq', 'ALERTA': 'alerta', 'INFO': 'info', 'COND': 'cond'}.get(s)


def esc(s: str) -> str:
    return s.replace("'", "\\'")


def gen_matriz(fn_class: str, const_name: str, file: str, secoes_map: dict, rules: list, gates_criticos: list, header: str):
    secao_type = f'SecaoMatriz{fn_class}'
    motor_type = f'MotorValidacao{fn_class}'
    regra_type = f'RegraMatriz{fn_class}'
    ordem = list(secoes_map.keys())
    lines = [header, '']
    lines.append(f'export type {secao_type} =')
    for s in ordem:
        lines.append(f"  | '{s}'")
    lines.append('')
    lines.append(f'export type {motor_type} =')
    for m in ['codigo', 'api', 'llm', 'rag', 'cross_doc', 'codigo_rag', 'cross_doc_rag', 'api_llm']:
        lines.append(f"  | '{m}'")
    lines.append('')
    lines.append(f"export type SeveridadeMatriz{fn_class} = 'bloq' | 'alerta' | 'info' | 'cond' | null")
    lines.append('')
    lines.append(f'export type {regra_type} = {{')
    for field in ['id: string', f'secao: {secao_type}', 'item: string', f'motor: {motor_type}',
                  f'severidade: SeveridadeMatriz{fn_class}', 'gate_condicional?: boolean',
                  'descricao: string', 'tooltip_conferencia: string', 'base_normativa: string']:
        lines.append(f'  {field}')
    lines.append('}')
    lines.append('')
    u = fn_class.upper()
    lines.append(f'export const ORDEM_SECOES_MATRIZ_{u}: readonly {secao_type}[] = [')
    for s in ordem:
        lines.append(f"  '{s}',")
    lines.append('] as const')
    lines.append('')
    lines.append(f'export const ROTULO_SECAO_MATRIZ_{u}: Record<{secao_type}, string> = {{')
    for s, rot in secoes_map.items():
        lines.append(f"  {s}: '{esc(rot)}',")
    lines.append('}')
    lines.append('')
    lines.append(f'export const ROTULO_SEVERIDADE_MATRIZ_{u}: Record<Exclude<SeveridadeMatriz{fn_class}, null>, string> = {{')
    lines.append("  bloq: 'BLOQ', alerta: 'ALERTA', info: 'INFO', cond: 'COND',")
    lines.append('}')
    lines.append('')
    lines.append(f'export const {const_name}: {regra_type}[] = [')
    cur = None
    for r in rules:
        if r['secao'] != cur:
            cur = r['secao']
            lines.append(f"  // ── {secoes_map[cur]} ──")
        gate = ',\n    gate_condicional: true' if r.get('gate_condicional') else ''
        sev_val = r['severidade']
        sev_line = f"severidade: {json.dumps(sev_val)}" if sev_val else 'severidade: null'
        lines.append('  {')
        lines.append(f"    id: '{r['id']}',")
        lines.append(f"    secao: '{r['secao']}',")
        lines.append(f"    item: '{esc(r['item'])}',")
        lines.append(f"    motor: '{r['motor']}',")
        lines.append(f'    {sev_line}{gate},')
        lines.append(f"    descricao: '{esc(r['descricao'])}',")
        lines.append(f"    tooltip_conferencia: '{esc(r['tooltip'])}',")
        lines.append(f"    base_normativa: '{esc(r['base'])}',")
        lines.append('  },')
    lines.append(']')
    lines.append('')
    lines.append(f'export const GATES_MATRIZ_{u}: readonly string[] =')
    lines.append(f"  {const_name}.filter((regra) => regra.severidade === 'bloq').map((regra) => regra.id)")
    lines.append('')
    lines.append(f'export const GATES_CRITICOS_MATRIZ_{u}: readonly string[] = [')
    for g in gates_criticos:
        lines.append(f"  '{g}',")
    lines.append(']')
    lines.append('')
    lines.append(f"export type ClassificacaoRisco{fn_class} = 'baixo_risco' | 'atencao' | 'alto_risco' | 'critico'")
    lines.append('')
    lines.append(f'export const ROTULO_CLASSIFICACAO_RISCO_{u}: Record<ClassificacaoRisco{fn_class}, string> = {{')
    lines.append("  baixo_risco: 'Baixo risco', atencao: 'Atenção', alto_risco: 'Alto risco', critico: 'Crítico',")
    lines.append('}')
    lines.append('')
    lines.append(f'export function classificacaoPorFaixaScore{fn_class}(score: number): ClassificacaoRisco{fn_class} {{')
    lines.append("  if (score >= 95) return 'baixo_risco'")
    lines.append("  if (score >= 80) return 'atencao'")
    lines.append("  if (score >= 60) return 'alto_risco'")
    lines.append("  return 'critico'")
    lines.append('}')
    lines.append('')
    lines.append(f'export function classificacaoRisco{fn_class}(score: number, gatesFalhos: readonly string[]): ClassificacaoRisco{fn_class} {{')
    lines.append(f'  const porScore = classificacaoPorFaixaScore{fn_class}(score)')
    lines.append('  if (gatesFalhos.length === 0) return porScore')
    lines.append(f'  const temGateCritico = gatesFalhos.some((id) => GATES_CRITICOS_MATRIZ_{u}.includes(id))')
    lines.append("  if (gatesFalhos.length >= 2 || temGateCritico) return 'critico'")
    lines.append("  return porScore === 'critico' ? 'critico' : 'alto_risco'")
    lines.append('}')
    lines.append('')
    lines.append(f'export function regraMatriz{fn_class}PorId(id: string): {regra_type} | undefined {{')
    lines.append(f'  return {const_name}.find((r) => r.id === id)')
    lines.append('}')
    lines.append('')
    with open(file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'Wrote {file} ({len(rules)} rules)')


def row_to_rule(row):
    return {
        'id': row[0], 'secao': row[1], 'item': row[2],
        'motor': motor(row[3]), 'severidade': sev(row[4]),
        'descricao': row[5], 'tooltip': row[6], 'base': row[7],
        'gate_condicional': row[4] == 'COND',
    }


BASE = r'C:\Users\danie\worthree-ajuste-smartdoc-03\servicos-global\produto\smart-read\shared'

PC_SECOES = {
    'identificacao_vinculos': '1 — Identificação e vínculos',
    'partes_comprador_vendedor': '2 — Partes (comprador e vendedor)',
    'termos_comerciais_logisticos': '3 — Termos comerciais e logísticos',
    'itens_linha': '4 — Itens de linha',
    'valores_financeiros': '5 — Valores e condições financeiras',
    'cambio_financeiro': '6 — Câmbio e financeiro internacional',
    'aprovacoes_controle': '7 — Aprovações e controle interno',
    'sinais_regulatorios': '8 — Sinais regulatórios antecipados',
    'consistencia_risco': '9 — Consistência e risco',
}

PC_RULES_RAW = [
('PC1-01','identificacao_vinculos','Número do PO','Código','ALERTA','Nº único do pedido de compra presente','Confere o número único do pedido de compra','Rastreabilidade; IN 680/06 art. 15, §1º'),
('PC1-02','identificacao_vinculos','Data de emissão','Código','ALERTA','Presente; deve ser anterior à proforma/invoice e ao embarque; alertar se futura','Valida a data e a ordem cronológica (PO antes da invoice)','Formação do contrato (CISG art. 14 e ss.)'),
('PC1-03','identificacao_vinculos','Vínculo com invoice/proforma','Cross-Doc','BLOQ','Nº do PO deve casar com a referência de PO na invoice (S1-03) e no pedido de venda (PV1-03); PO órfão é red flag','Cruza o PO com a referência declarada na invoice e no pedido de venda','IN 680/06 art. 15, §1º; coerência do dossiê comercial'),
('PC1-04','identificacao_vinculos','Revisão / versão do PO','IA (LLM)','ALERTA','Detectar versão/revisão; duas versões divergentes exigem a vigente','Identifica revisões do pedido e sinaliza versões conflitantes','RA art. 725'),
('PC1-05','identificacao_vinculos','Moeda do pedido','Código','ALERTA','Moeda ISO 4217; mesma da invoice (S5-01) e do câmbio','Valida a moeda do pedido e a coerência com invoice e câmbio','ISO 4217; normas cambiais BCB'),
('PC2-01','partes_comprador_vendedor','Comprador / importador','Cross-Doc','ALERTA','Comprador identificado; casa com importador da invoice (S2-03)','Confere o comprador contra o importador da invoice','AVA-GATT art. 1º'),
('PC2-02','partes_comprador_vendedor','CNPJ do comprador','Código','COND','Quando presente: 14 posições + DV Módulo 11; idêntico ao importador','Valida o CNPJ do comprador quando presente','IN RFB 2.229/2024; IN RFB 2119/2022'),
('PC2-03','partes_comprador_vendedor','Vendedor / exportador','Cross-Doc','ALERTA','Vendedor identificado; casa com exportador da invoice (S2-05) e PV (PV2-01)','Confere o vendedor contra o exportador da invoice','AVA-GATT art. 1º'),
('PC2-04','partes_comprador_vendedor','Adquirente / encomendante real','IA (LLM)','BLOQ','Comprador do PO difere do importador DUIMP sem declaração de conta e ordem/encomenda','Detecta comprador distinto do importador — indício de interposição','IN RFB 1861/2018; DL 1.455/76 art. 23, XXII'),
('PC2-05','partes_comprador_vendedor','Vínculo entre as partes (relacionadas)','IA (LLM)','ALERTA','Indícios de partes relacionadas (intercompany) para verificação de valoração','Sinaliza indício de partes relacionadas para checagem de valoração','AVA-GATT art. 1º, §2º e art. 15'),
('PC3-01','termos_comerciais_logisticos','Incoterm e local','Cross-Doc','ALERTA','Incoterms® 2020 + local; casa com invoice (S3-01) e PV (PV3-01)','Confere o Incoterm do pedido contra invoice e pedido de venda','Incoterms® 2020; AVA-GATT art. 8º'),
('PC3-02','termos_comerciais_logisticos','Prazo de entrega / shipment','IA (LLM)','INFO','Data ou janela de embarque acordada; coerente com BL/AWB','Verifica o prazo de embarque acordado contra o conhecimento','CISG art. 33'),
('PC3-03','termos_comerciais_logisticos','Origem/destino acordados','Cross-Doc','ALERTA','País de origem coerente com CO (CO2-04) e rota; destino = importador','Cruza origem/destino do pedido com certificado de origem e rota','RA arts. 30–35'),
('PC3-04','termos_comerciais_logisticos','Termos de pagamento','Cross-Doc','ALERTA','Condição de pagamento coerente com invoice (S6-03) e câmbio','Confere os termos de pagamento contra a invoice e o câmbio','Normas cambiais BCB'),
('PC4-01','itens_linha','Part number / SKU','Cross-Doc','COND','PN/SKU por item; casa com invoice (S4-01), PL (P6-02) e catálogo','Confere part numbers do pedido contra invoice e catálogo','Catálogo DUIMP; rastreabilidade'),
('PC4-02','itens_linha','Descrição do produto','IA (LLM)','ALERTA','Descrição específica por item; rejeitar genéricos','Exige descrição específica por item — alimenta invoice e catálogo','AVA-GATT; Catálogo DUIMP'),
('PC4-03','itens_linha','Quantidade e unidade','Cross-Doc','ALERTA','Quantidade e unidade por item; invoice não deve exceder o pedido','Confere quantidades do pedido contra a invoice','CISG art. 35'),
('PC4-04','itens_linha','Preço unitário acordado','Cross-Doc','BLOQ','Preço unitário do PO = preço da invoice (S5-03); divergência é red flag de valoração','Compara o preço unitário acordado com o da invoice — divergência é red flag','AVA-GATT art. 1º; RA art. 711'),
('PC4-05','itens_linha','Marca e modelo','IA (LLM)','COND','Marca/modelo por item quando presentes; alimentam Catálogo DUIMP','Extrai marca e modelo por item — atributos do catálogo DUIMP','Catálogo de Produtos DUIMP'),
('PC5-01','valores_financeiros','Multiplicação de linha','Código','ALERTA','Qtd × preço unitário = total da linha','Recalcula quantidade × preço unitário por linha','Consistência aritmética'),
('PC5-02','valores_financeiros','Somatório e total','Código','ALERTA','Σ linhas + acréscimos − descontos = total do pedido','Soma as linhas e confere o total do pedido','Consistência aritmética'),
('PC5-03','valores_financeiros','Total PO × total invoice','Cross-Doc','BLOQ','Total do pedido = total da invoice; divergência global é red flag de valoração','Compara o total do pedido com o total da invoice','AVA-GATT art. 1º; RA art. 711'),
('PC5-04','valores_financeiros','Descontos — natureza','IA (LLM)','COND','Desconto acordado com natureza declarada; refletir na invoice (S5-08)','Confere descontos e sua natureza contra a invoice','AVA-GATT art. 1º; RA art. 557'),
('PC5-05','valores_financeiros','Custos adicionais (royalties, ferramental)','IA (LLM)','ALERTA','Detectar royalties, tooling, assists que compõem valor aduaneiro','Detecta royalties/ferramental/assists que compõem o valor aduaneiro','AVA-GATT art. 8º, 1'),
('PC6-01','cambio_financeiro','Dados bancários do beneficiário','Cross-Doc','COND','Banco/conta do vendedor coerentes com invoice (S6-01)','Confere dados bancários do pedido contra a invoice','Normas cambiais BCB (Res. 277/2022)'),
('PC6-02','cambio_financeiro','Coerência com contratação de câmbio','Cross-Doc','BLOQ','Valor, moeda e beneficiário do PO devem sustentar câmbio; pagamento a terceiro é red flag','Verifica se o pedido sustenta o câmbio — pagamento a terceiro é red flag','Lei 14.286/2021; Res. BCB 277/2022'),
('PC6-03','cambio_financeiro','Antecipação / pré-pagamento','IA (LLM)','COND','Pagamento antecipado: verificar prazo e coerência com entrega','Detecta pré-pagamento e sua coerência com a entrega','Normas cambiais BCB'),
('PC7-01','aprovacoes_controle','Aprovação / assinatura do comprador','IA (LLM)','ALERTA','Assinatura ou aprovação eletrônica do responsável pela compra','Verifica a aprovação/assinatura do comprador no pedido','Controle interno; CISG art. 18'),
('PC7-02','aprovacoes_controle','Aceite do vendedor','Cross-Doc','INFO','Evidência de aceite (order acknowledgment / pedido de venda PV)','Verifica o aceite do vendedor (vínculo com pedido de venda)','CISG arts. 18–23'),
('PC7-03','aprovacoes_controle','Termos e condições anexos','IA (LLM)','INFO','Referência a T&C / contrato-quadro; sinalizar cláusulas relevantes','Detecta termos e condições anexos ao pedido','CISG; contrato internacional'),
('PC8-01','sinais_regulatorios','NCM esperada / pré-classificação','Cross-Doc','COND','Quando o PO traz NCM: antecipar anuências e tributação','Antecipa a NCM esperada para planejamento de anuências e tributos','Pré-classificação; Portal Único'),
('PC8-02','sinais_regulatorios','Anuências antecipadas','Cross-Doc + RAG','COND','Produto que exigirá LPCO: sinalizar já no pedido','Sinaliza anuências prováveis já na fase de pedido','Tratamento administrativo; LPCO'),
('PC8-03','sinais_regulatorios','Bens usados / remanufaturados','IA (LLM)','COND','Indício de bem usado/remanufaturado exige licenciamento próprio','Detecta bem usado ou remanufaturado que exige licenciamento próprio','Portaria SECEX; anuência específica'),
('PC9-01','consistencia_risco','Legibilidade e integridade','IA (LLM)','ALERTA','Legível, sem rasuras ou alterações suspeitas','Avalia legibilidade e integridade do pedido','Boa prática documental'),
('PC9-02','consistencia_risco','Coerência global PC × PV × invoice','Cross-Doc','ALERTA','Parecer único: pedido de compra × pedido de venda × invoice consistentes','Consolida a coerência entre os dois pedidos e a invoice','AVA-GATT; coerência do dossiê'),
('PC9-03','consistencia_risco','Plausibilidade de preço','IA (LLM) + API','INFO','Preço do PO vs histórico e mercado; outlier severo sinaliza valoração','Compara preços do pedido com histórico e mercado','MP 2.158-35/01 art. 88; RA art. 703'),
('PC9-04','consistencia_risco','Risco de valoração / interposição','Código','BLOQ','Consolidar: divergência preço PO×invoice, interposição, pagamento a terceiro','Consolida o risco de valoração e interposição do pedido','AVA-GATT; RA arts. 711/725; DL 1.455/76 art. 23'),
('PC9-05','consistencia_risco','Score documental','Código',None,'Score 0–100 sobre regras ALERTA/INFO aplicáveis','Pontuação de qualidade documental do pedido','Metodologia interna'),
('PC9-06','consistencia_risco','Classificação de risco (gates + score)','Código',None,'Pior entre score e gates. Gates: PC1-03, PC2-04, PC4-04, PC5-03, PC6-02, PC9-04','Classificação final combinando gates e pontuação','Metodologia interna'),
]

PV_SECOES = {
    'identificacao_vinculos': '1 — Identificação e vínculos',
    'partes_vendedor_comprador': '2 — Partes (vendedor e comprador)',
    'termos_comerciais_logisticos': '3 — Termos comerciais e logísticos',
    'itens_linha': '4 — Itens de linha',
    'valores_financeiros': '5 — Valores e condições financeiras',
    'dados_bancarios_cambio': '6 — Dados bancários e câmbio',
    'aceite_contrato': '7 — Aceite e formação do contrato',
    'sinais_regulatorios': '8 — Sinais regulatórios antecipados',
    'consistencia_risco': '9 — Consistência e risco',
}

PV_RULES_RAW = [
('PV1-01','identificacao_vinculos','Número do pedido de venda','Código','ALERTA','Nº único do sales order / order confirmation presente','Confere o número único do pedido de venda','Rastreabilidade; IN 680/06 art. 15, §1º'),
('PV1-02','identificacao_vinculos','Natureza do documento','IA (LLM)','ALERTA','Classificar: order confirmation, sales order, proforma ou quotation. Proforma não substitui invoice','Identifica o tipo do documento e alerta que proforma não instrui o despacho','RA art. 553, II; analogia art. 557'),
('PV1-03','identificacao_vinculos','Vínculo com o PO e a invoice','Cross-Doc','BLOQ','Referência ao nº do PO (PC1-01) e coerência com invoice (S1-03); PV sem PO é red flag','Cruza o pedido de venda com o pedido de compra e a invoice','CISG art. 18; IN 680/06 art. 15, §1º'),
('PV1-04','identificacao_vinculos','Data de emissão','Código','ALERTA','Presente; posterior ao PO e anterior ou igual à invoice; alertar se futura','Valida a data e a ordem cronológica (PO → PV → invoice)','CISG art. 18'),
('PV1-05','identificacao_vinculos','Moeda','Código','ALERTA','Moeda ISO 4217; igual à do PO (PC1-05) e da invoice (S5-01)','Valida a moeda e a coerência com pedido de compra e invoice','ISO 4217; normas cambiais BCB'),
('PV2-01','partes_vendedor_comprador','Vendedor / exportador (emissor)','Cross-Doc','ALERTA','Vendedor identificado; casa com exportador da invoice (S2-05) e PO (PC2-03)','Confere o vendedor contra invoice e pedido de compra','AVA-GATT art. 1º'),
('PV2-02','partes_vendedor_comprador','Fabricante','Cross-Doc','COND','Quando vendedor ≠ fabricante: fabricante identificado; alimenta Catálogo DUIMP','Extrai o fabricante quando distinto do vendedor — atributo do catálogo','Catálogo DUIMP'),
('PV2-03','partes_vendedor_comprador','Comprador / importador','Cross-Doc','ALERTA','Comprador identificado; casa com importador da invoice (S2-03) e PO (PC2-01)','Confere o comprador contra invoice e pedido de compra','AVA-GATT art. 1º'),
('PV2-04','partes_vendedor_comprador','Consignatário / entrega','IA (LLM)','COND','Entrega a terceiro/filial diferente do comprador; cruza com notify da invoice (S2-09)','Detecta entrega a terceiro e cruza com o notify da invoice','IN 680/06 art. 29, II'),
('PV2-05','partes_vendedor_comprador','Partes relacionadas','IA (LLM)','ALERTA','Indícios de vínculo entre vendedor e comprador (intercompany)','Sinaliza indício de partes relacionadas para checagem de valoração','AVA-GATT art. 1º, §2º e art. 15'),
('PV3-01','termos_comerciais_logisticos','Incoterm e local','Cross-Doc','BLOQ','Incoterms® 2020 + local; casa com PO (PC3-01) e invoice (S3-01). Incoterm confirmado ≠ pedido = contraproposta','Confere o Incoterm confirmado contra pedido de compra e invoice','Incoterms® 2020; CISG art. 19'),
('PV3-02','termos_comerciais_logisticos','Prazo de embarque confirmado','Cross-Doc','ALERTA','Data/janela confirmada; coerente com PO (PC3-02) e embarque BL/AWB','Confere o prazo de embarque confirmado contra pedido e conhecimento','CISG art. 33'),
('PV3-03','termos_comerciais_logisticos','Origem confirmada','Cross-Doc','ALERTA','País de origem/fabricação confirmado; coerente com CO, PO e rota','Cruza a origem confirmada com certificado, pedido e rota','RA arts. 30–35'),
('PV3-04','termos_comerciais_logisticos','Termos de pagamento confirmados','Cross-Doc','ALERTA','Condição confirmada coerente com PO, invoice e câmbio','Confere os termos de pagamento confirmados contra pedido, invoice e câmbio','Normas cambiais BCB'),
('PV3-05','termos_comerciais_logisticos','Validade da confirmação/oferta','IA (LLM)','INFO','Prazo de validade da confirmação ou proforma','Verifica o prazo de validade da confirmação/proforma','CISG art. 18, §2º'),
('PV4-01','itens_linha','Part number / SKU','Cross-Doc','COND','PN/SKU por item; casa com PO, invoice e catálogo','Confere part numbers contra pedido, invoice e catálogo','Catálogo DUIMP'),
('PV4-02','itens_linha','Descrição do produto','Cross-Doc','ALERTA','Descrição específica; coerente com PO e base da descrição da invoice','Confere a descrição confirmada contra pedido e invoice','AVA-GATT; Catálogo DUIMP'),
('PV4-03','itens_linha','Quantidade confirmada','Cross-Doc','BLOQ','Quantidade confirmada = quantidade pedida (PC4-03) e faturada (S4-05)','Compara a quantidade confirmada com a pedida e a faturada','CISG art. 19'),
('PV4-04','itens_linha','Preço unitário confirmado','Cross-Doc','BLOQ','Preço confirmado = preço do PO e da invoice; divergência é red flag de valoração','Compara o preço confirmado com o pedido e o faturado — divergência é red flag','AVA-GATT art. 1º; CISG art. 19; RA art. 711'),
('PV4-05','itens_linha','Marca e modelo','IA (LLM)','COND','Marca/modelo por item quando presentes; alimentam Catálogo DUIMP','Extrai marca e modelo por item — atributos do catálogo','Catálogo de Produtos DUIMP'),
('PV5-01','valores_financeiros','Multiplicação de linha','Código','ALERTA','Qtd × preço unitário = total da linha','Recalcula quantidade × preço unitário por linha','Consistência aritmética'),
('PV5-02','valores_financeiros','Somatório e total','Código','ALERTA','Σ linhas + acréscimos − descontos = total confirmado','Soma as linhas e confere o total confirmado','Consistência aritmética'),
('PV5-03','valores_financeiros','Total PV × PO × invoice','Cross-Doc','BLOQ','Total confirmado = total do PO e da invoice; divergência global é red flag','Compara o total confirmado com pedido e invoice','AVA-GATT art. 1º; RA art. 711'),
('PV5-04','valores_financeiros','Frete e seguro (se CIF/CIP)','Cross-Doc','ALERTA','Em C/D: frete e seguro discriminados coerentes com Incoterm e invoice','Confere frete e seguro confirmados contra Incoterm e invoice','AVA-GATT art. 8º; Incoterms® 2020'),
('PV5-05','valores_financeiros','Descontos e custos adicionais','IA (LLM)','COND','Desconto com natureza; royalties/ferramental/assists sinalizados','Confere descontos e detecta custos que compõem o valor aduaneiro','AVA-GATT art. 8º; RA art. 557'),
('PV6-01','dados_bancarios_cambio','Beneficiário bancário','Cross-Doc','COND','Banco/conta do vendedor; coerente com invoice e PO','Confere dados bancários contra invoice e pedido de compra','Res. BCB 277/2022'),
('PV6-02','dados_bancarios_cambio','SWIFT / IBAN','Código','COND','Formato internacional (ISO 9362 / ISO 13616) quando presente','Valida SWIFT/IBAN quando presente','ISO 9362; ISO 13616'),
('PV6-03','dados_bancarios_cambio','Beneficiário ≠ vendedor','Cross-Doc','BLOQ','Pagamento a terceiro distinto do vendedor: red flag de triangulação financeira','Sinaliza pagamento a terceiro distinto do vendedor — red flag','Res. BCB 277/2022; DL 1.455/76 art. 23'),
('PV7-01','aceite_contrato','Assinatura/aprovação do vendedor','IA (LLM)','ALERTA','Assinatura ou aprovação eletrônica do vendedor confirmando a venda','Verifica a assinatura/aprovação do vendedor','CISG art. 18'),
('PV7-02','aceite_contrato','Aceite com modificações (contraproposta)','Cross-Doc','BLOQ','Divergências materiais PO↔PV (preço, quantidade, Incoterm, prazo) = contraproposta CISG art. 19','Detecta contraproposta que descaracteriza o aceite','CISG art. 19'),
('PV7-03','aceite_contrato','Referência a termos e condições','IA (LLM)','INFO','Referência a T&C de venda / contrato-quadro','Detecta termos e condições de venda anexos','CISG; contrato internacional'),
('PV8-01','sinais_regulatorios','NCM / HS informada pelo vendedor','Cross-Doc','COND','HS/NCM informada pelo exportador como insumo à pré-classificação, sem vincular','Usa a HS do vendedor como insumo à pré-classificação, sem vinculação','NCM/SH; responsabilidade do importador'),
('PV8-02','sinais_regulatorios','Anuências antecipadas','Cross-Doc + RAG','COND','Produto que exigirá LPCO: sinalizar para licenciar antes do embarque','Sinaliza anuências prováveis já na confirmação da venda','Tratamento administrativo; LPCO'),
('PV8-03','sinais_regulatorios','Especificações técnicas / certificados prometidos','IA (LLM)','COND','Compromissos do vendedor (laudo, ficha técnica, MSDS) que instruirão o despacho','Detecta certificados/laudos prometidos que instruirão o despacho','Anuências específicas; carga perigosa'),
('PV9-01','consistencia_risco','Legibilidade e integridade','IA (LLM)','ALERTA','Legível, sem rasuras ou alterações suspeitas','Avalia legibilidade e integridade do pedido de venda','Boa prática documental'),
('PV9-02','consistencia_risco','Simetria PV × PO × invoice','Cross-Doc','BLOQ','Parecer único de simetria: divergências materiais sinalizam contrato não fechado ou valoração','Consolida a simetria entre pedido de compra, pedido de venda e invoice','CISG art. 19; AVA-GATT'),
('PV9-03','consistencia_risco','Plausibilidade de preço','IA (LLM) + API','INFO','Preço confirmado vs histórico e mercado; outlier severo sinaliza valoração','Compara preços confirmados com histórico e mercado','MP 2.158-35/01 art. 88; RA art. 703'),
('PV9-04','consistencia_risco','Risco de valoração / contrato / câmbio','Código','BLOQ','Consolidar: contraproposta não fechada, divergência de preço, pagamento a terceiro','Consolida o risco de contrato, valoração e câmbio','CISG art. 19; AVA-GATT; DL 1.455/76 art. 23'),
('PV9-05','consistencia_risco','Score documental','Código',None,'Score 0–100 sobre regras ALERTA/INFO aplicáveis','Pontuação de qualidade documental do pedido de venda','Metodologia interna'),
('PV9-06','consistencia_risco','Classificação de risco (gates + score)','Código',None,'Pior entre score e gates. Gates: PV1-03, PV3-01, PV4-03, PV4-04, PV5-03, PV6-03, PV7-02, PV9-02, PV9-04','Classificação final combinando gates e pontuação','Metodologia interna'),
]

if __name__ == '__main__':
    gen_matriz(
        'PedidoCompra', 'MATRIZ_VALIDACAO_PEDIDO_COMPRA',
        f'{BASE}\\matriz-validacao-pedido-compra-smart-read.ts',
        PC_SECOES, [row_to_rule(r) for r in PC_RULES_RAW],
        ['PC4-04', 'PC5-03', 'PC2-04', 'PC6-02'],
        """/**
 * matriz-validacao-pedido-compra-smart-read.ts — SSOT Matriz de Validação do Pedido de Compra / PO (v1.0)
 *
 * Documento comercial emitido pelo importador. Ancora cadeia de valoração, câmbio, antifraude e Catálogo DUIMP.
 * Base: AVA-GATT arts. 1º e 8º · RA arts. 76–83 e 711 · IN RFB 1861/2018 · DL 1.455/76 art. 23 ·
 * Res. BCB 277/2022 · IN 680/06 art. 15 · CISG (Decreto 8.327/2014).
 */""",
    )
    gen_matriz(
        'PedidoVenda', 'MATRIZ_VALIDACAO_PEDIDO_VENDA',
        f'{BASE}\\matriz-validacao-pedido-venda-smart-read.ts',
        PV_SECOES, [row_to_rule(r) for r in PV_RULES_RAW],
        ['PV7-02', 'PV9-02', 'PV4-04', 'PV5-03', 'PV6-03'],
        """/**
 * matriz-validacao-pedido-venda-smart-read.ts — SSOT Matriz de Validação do Pedido de Venda / SO (v1.0)
 *
 * Order confirmation / sales order emitido pelo exportador. Espelho vendedor do PO — simetria PC↔PV é a regra-mãe.
 * Base: CISG (Decreto 8.327/2014) arts. 18–23 · AVA-GATT arts. 1º e 8º · RA arts. 76–83 e 711 ·
 * IN RFB 1861/2018 · DL 1.455/76 art. 23 · Res. BCB 277/2022 · IN 680/06 art. 15.
 */""",
    )
