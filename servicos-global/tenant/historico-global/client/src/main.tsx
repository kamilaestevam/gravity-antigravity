import React from 'react'
import { createRoot } from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import { Historico } from '@tenant/historico'

i18n.use(initReactI18next).init({
  lng: 'pt',
  resources: {
    pt: {
      translation: {
        'admin.history.titulo': 'Histórico',
        'admin.history.subtitulo': 'Audit trail de todas as ações da plataforma',
        'admin.history.tabela.quando': 'Quando',
        'admin.history.tabela.quem': 'Quem',
        'admin.history.tabela.acao': 'Ação',
        'admin.history.tabela.o_que_foi_feito': 'O que foi feito',
        'tabela.ordenar': 'Ordenar',
        'tabela.crescente': 'Cresc.',
        'tabela.decrescente': 'Decresc.',
        'tabela.filtrar_por': 'Filtrar por',
        'tabela.pesquisar_valores': 'Pesquisar valores',
        'tabela.buscar': 'Buscar…',
        'tabela.buscar_tooltip_padrao': 'Pesquise por qualquer termo visível na tabela',
        'tabela.localizar': 'Localizar',
        'tabela.sem_valor': 'Nenhum valor',
        'tabela.intervalo': 'Intervalo',
        'tabela.minimo': 'Mín',
        'tabela.maximo': 'Máx',
        'tabela.selecionar_periodo': 'Selecione o Período',
        'tabela.limpar_filtro': 'Limpar filtro',
        'tabela.limpar_filtros': 'Limpar filtros',
        'tabela.limpar': 'Limpar',
        'tabela.sem_resultado': 'Nenhum resultado.',
        'tabela.sem_filtro': 'Nenhum registro cadastrado.',
        'tabela.exportar': 'Exportar',
        'tabela.baixar_resultados': 'Baixe os resultados atuais da tabela',
        'tabela.acoes': 'Ações',
        'tabela.tooltip_acoes': 'Comandos rápidos disponíveis para este registro',
        'tabela.selecionar_todos': 'Selecionar todos',
        'tabela.nenhum_registro': 'Nenhum registro',
        'tabela.por_pagina_label': 'por página',
        'tabela.de': 'de',
        'tabela.gerenciar_colunas': 'Gerenciar colunas',
        'tabela.filtro_ativo_singular': '{{count}} filtro ativo',
        'tabela.filtro_ativo_plural': '{{count}} filtros ativos',
        'tabela.selecionado_singular': '{{count}} selecionado',
        'tabela.selecionado_plural': '{{count}} selecionados',
      },
    },
  },
  interpolation: { escapeValue: false },
})

const root = document.getElementById('root')!
createRoot(root).render(
  <React.StrictMode>
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <Historico productId="all" apiBaseUrl="http://localhost:8030" useMock={true} />
    </div>
  </React.StrictMode>
)
