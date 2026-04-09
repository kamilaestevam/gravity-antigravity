import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    pt: {
      translation: {
        tabela: {
          ordenar:              'Ordenar',
          crescente:            'Cresc.',
          decrescente:          'Decresc.',
          filtrar_por:          'Filtrar por',
          pesquisar_valores:    'Pesquisar valores',
          buscar:               'Buscar…',
          buscar_tooltip_padrao:'Pesquise por qualquer termo visível na tabela',
          localizar:            'Localizar',
          sem_valor:            'Nenhum valor',
          intervalo:            'Intervalo',
          minimo:               'Mín',
          maximo:               'Máx',
          selecionar_periodo:   'Selecione o Período',
          limpar_filtro:        'Limpar filtro',
          limpar_filtros:       'Limpar filtros',
          limpar:               'Limpar',
          sem_resultado:        'Nenhum resultado.',
          sem_filtro:           'Nenhum registro cadastrado.',
          exportar:             'Exportar',
          baixar_resultados:    'Baixe os resultados atuais da tabela',
          acoes:                'Ações',
          tooltip_acoes:        'Comandos rápidos disponíveis para este registro',
          selecionar_todos:     'Selecionar todos',
          nenhum_registro:      'Nenhum registro',
          por_pagina:           'por página',
          de:                   'de',
          gerenciar_colunas:    'Gerenciar colunas',
          filtro_ativo_singular:'{{count}} filtro ativo',
          filtro_ativo_plural:  '{{count}} filtros ativos',
          selecionado_singular: '{{count}} selecionado',
          selecionado_plural:   '{{count}} selecionados',
          carregar_mais:        'Carregar mais',
          carregando:           'Carregando…',
          expandir:             'Expandir',
          recolher:             'Recolher',
        },
      },
    },
  },
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
})

export default i18n
