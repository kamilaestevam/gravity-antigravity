import '../../styles/marketplace-fundo-hero.css'

/** Tela de fundo padrao da home — fixa atras de navbar, conteudo e footer */
export function MarketplaceFundoHero() {
  return (
    <div className="marketplace-fundo-hero" aria-hidden>
      <div className="marketplace-fundo-hero__glows">
        <div className="ambient-glow glow-indigo" />
        <div className="ambient-glow glow-purple" />
        <div className="ambient-glow glow-cyan" />
      </div>
    </div>
  )
}

