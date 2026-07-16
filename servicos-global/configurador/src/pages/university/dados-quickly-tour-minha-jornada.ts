/** Telas do Quickly Tour — modelo Explore aqui + Siga em frente (Minha jornada). */

export type ItemExplorarQuicklyTour = {
  chaveTitulo: string
  chaveDescricao: string
  idAlvo?: string
}

export type AvancarQuicklyTour = {
  chaveTitulo: string
  chaveDescricao: string
  chaveAcao?: string
  idAlvo?: string
}

export type TelaQuicklyTourMinhaJornada = {
  id: string
  chaveTitulo: string
  chaveResumo: string
  explorar: ItemExplorarQuicklyTour[]
  avancar: AvancarQuicklyTour
}

export const TELAS_QUICKLY_TOUR_MINHA_JORNADA: TelaQuicklyTourMinhaJornada[] = [
  {
    id: 'panorama',
    chaveTitulo: 'university.quickly_tour.telas.panorama.titulo',
    chaveResumo: 'university.quickly_tour.telas.panorama.resumo',
    explorar: [
      {
        chaveTitulo: 'university.quickly_tour.telas.panorama.explorar.hero.titulo',
        chaveDescricao: 'university.quickly_tour.telas.panorama.explorar.hero.descricao',
        idAlvo: 'qt-jornada-hero',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.panorama.explorar.continuar.titulo',
        chaveDescricao: 'university.quickly_tour.telas.panorama.explorar.continuar.descricao',
        idAlvo: 'qt-jornada-hero-botao',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.panorama.explorar.kpis.titulo',
        chaveDescricao: 'university.quickly_tour.telas.panorama.explorar.kpis.descricao',
        idAlvo: 'qt-jornada-kpis',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.panorama.explorar.certificados.titulo',
        chaveDescricao: 'university.quickly_tour.telas.panorama.explorar.certificados.descricao',
        idAlvo: 'qt-jornada-certificados',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.panorama.explorar.progresso.titulo',
        chaveDescricao: 'university.quickly_tour.telas.panorama.explorar.progresso.descricao',
        idAlvo: 'qt-jornada-progresso',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.panorama.explorar.faltam.titulo',
        chaveDescricao: 'university.quickly_tour.telas.panorama.explorar.faltam.descricao',
        idAlvo: 'qt-jornada-faltam',
      },
    ],
    avancar: {
      chaveAcao: 'university.quickly_tour.telas.panorama.avancar.acao',
      chaveTitulo: 'university.quickly_tour.telas.panorama.avancar.titulo',
      chaveDescricao: 'university.quickly_tour.telas.panorama.avancar.descricao',
      idAlvo: 'qt-jornada-nivel',
    },
  },
  {
    id: 'gamificacao',
    chaveTitulo: 'university.quickly_tour.telas.gamificacao.titulo',
    chaveResumo: 'university.quickly_tour.telas.gamificacao.resumo',
    explorar: [
      {
        chaveTitulo: 'university.quickly_tour.telas.gamificacao.explorar.nivel.titulo',
        chaveDescricao: 'university.quickly_tour.telas.gamificacao.explorar.nivel.descricao',
        idAlvo: 'qt-jornada-nivel',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.gamificacao.explorar.recompensas.titulo',
        chaveDescricao: 'university.quickly_tour.telas.gamificacao.explorar.recompensas.descricao',
        idAlvo: 'qt-jornada-recompensas',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.gamificacao.explorar.ranking.titulo',
        chaveDescricao: 'university.quickly_tour.telas.gamificacao.explorar.ranking.descricao',
        idAlvo: 'qt-jornada-ranking',
      },
    ],
    avancar: {
      chaveAcao: 'university.quickly_tour.telas.gamificacao.avancar.acao',
      chaveTitulo: 'university.quickly_tour.telas.gamificacao.avancar.titulo',
      chaveDescricao: 'university.quickly_tour.telas.gamificacao.avancar.descricao',
      idAlvo: 'qt-menu-minha-jornada',
    },
  },
  {
    id: 'menu-basico',
    chaveTitulo: 'university.quickly_tour.telas.menu_basico.titulo',
    chaveResumo: 'university.quickly_tour.telas.menu_basico.resumo',
    explorar: [
      {
        chaveTitulo: 'university.quickly_tour.telas.menu_basico.explorar.jornada.titulo',
        chaveDescricao: 'university.quickly_tour.telas.menu_basico.explorar.jornada.descricao',
        idAlvo: 'qt-menu-minha-jornada',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.menu_basico.explorar.modulo.titulo',
        chaveDescricao: 'university.quickly_tour.telas.menu_basico.explorar.modulo.descricao',
        idAlvo: 'qt-menu-modulo-basico',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.menu_basico.explorar.status.titulo',
        chaveDescricao: 'university.quickly_tour.telas.menu_basico.explorar.status.descricao',
        idAlvo: 'qt-menu-legenda-status',
      },
    ],
    avancar: {
      chaveAcao: 'university.quickly_tour.telas.menu_basico.avancar.acao',
      chaveTitulo: 'university.quickly_tour.telas.menu_basico.avancar.titulo',
      chaveDescricao: 'university.quickly_tour.telas.menu_basico.avancar.descricao',
      idAlvo: 'qt-menu-pedido',
    },
  },
  {
    id: 'produtos',
    chaveTitulo: 'university.quickly_tour.telas.produtos.titulo',
    chaveResumo: 'university.quickly_tour.telas.produtos.resumo',
    explorar: [
      {
        chaveTitulo: 'university.quickly_tour.telas.produtos.explorar.pedido.titulo',
        chaveDescricao: 'university.quickly_tour.telas.produtos.explorar.pedido.descricao',
        idAlvo: 'qt-menu-pedido',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.produtos.explorar.smart_read.titulo',
        chaveDescricao: 'university.quickly_tour.telas.produtos.explorar.smart_read.descricao',
        idAlvo: 'qt-menu-smart-read',
      },
      {
        chaveTitulo: 'university.quickly_tour.telas.produtos.explorar.bid_frete.titulo',
        chaveDescricao: 'university.quickly_tour.telas.produtos.explorar.bid_frete.descricao',
        idAlvo: 'qt-menu-bid-frete',
      },
    ],
    avancar: {
      chaveAcao: 'university.quickly_tour.telas.produtos.avancar.acao',
      chaveTitulo: 'university.quickly_tour.telas.produtos.avancar.titulo',
      chaveDescricao: 'university.quickly_tour.telas.produtos.avancar.descricao',
      idAlvo: 'qt-jornada-hero',
    },
  },
]
