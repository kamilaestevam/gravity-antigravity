export type LinhaListaSimuladorBidFrete = {
  id: string
  numeroCotacao: string
  status: string
  operacao: string
  modal: string
  modalidade: string
  portoDestino: string
  portoOrigem: string
  tipoContainer: string
  pesoKg: string
}

export const LINHAS_LISTA_SIMULADOR_BID_FRETE: LinhaListaSimuladorBidFrete[] = [
  {
    id: 'cot-1',
    numeroCotacao: 'COT-20260705-9478',
    status: 'ENVIADA_FORNECEDORES',
    operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    portoDestino: 'BRALT — Alenquer, BR',
    portoOrigem: 'VNHPH — Haiphong, VN',
    tipoContainer: "1× 22G0 — Dry 20'",
    pesoKg: '18.420',
  },
  {
    id: 'cot-2',
    numeroCotacao: 'COT-20260704-8821',
    status: 'RASCUNHO',
    operacao: 'EXPORTACAO',
    modal: 'RODOVIARIO',
    modalidade: 'LTL',
    portoDestino: 'BRSSZ — Santos, BR',
    portoOrigem: 'ARBUE — Buenos Aires, AR',
    tipoContainer: '1× UNIDADE',
    pesoKg: '4.200',
  },
  {
    id: 'cot-3',
    numeroCotacao: 'COT-20260703-7710',
    status: 'EM_COTACAO',
    operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    portoDestino: 'BRPNG — Paranaguá, BR',
    portoOrigem: 'CNSHA — Shanghai, CN',
    tipoContainer: "2× 42G0 — Dry 40'",
    pesoKg: '32.800',
  },
  {
    id: 'cot-4',
    numeroCotacao: 'COT-20260702-6594',
    status: 'AGUARDANDO_APROVACAO',
    operacao: 'IMPORTACAO',
    modal: 'AEREO',
    modalidade: 'LCL',
    portoDestino: 'BRGRU — Guarulhos, BR',
    portoOrigem: 'USMIA — Miami, US',
    tipoContainer: '—',
    pesoKg: '980',
  },
  {
    id: 'cot-5',
    numeroCotacao: 'COT-20260701-5488',
    status: 'APROVADA',
    operacao: 'EXPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    portoDestino: 'DEHAM — Hamburgo, DE',
    portoOrigem: 'BRSSZ — Santos, BR',
    tipoContainer: "1× 45G0 — High Cube 40'",
    pesoKg: '21.150',
  },
  {
    id: 'cot-6',
    numeroCotacao: 'COT-20260630-4372',
    status: 'REPROVADA',
    operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    portoDestino: 'BRIOA — Itapoá, BR',
    portoOrigem: 'KRPUS — Busan, KR',
    tipoContainer: "1× 22G0 — Dry 20'",
    pesoKg: '12.600',
  },
]
