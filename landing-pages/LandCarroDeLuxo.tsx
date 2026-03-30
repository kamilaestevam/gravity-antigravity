import type { Metadata } from "next";
import Image from "next/image";
import type { PropsWithChildren, ReactNode } from "react";

const SITE_URL = "https://dmmtrading.com.br";
const PAGE_PATH = "/importacao-de-carros-de-luxo";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const OG_IMAGE = `${SITE_URL}/images/front.jpeg`;

const COMPANY = {
  name: "DMM Importação e Exportação Ltda",
  brand: "DMM Importação e Exportação",
  phoneDisplay: "+55 11 96655-0005",
  phoneRaw: "5511966550005",
  email: "contato@dmmtrading.com.br",
  address: {
    streetAddress: "Rua Doutor Pedro Ferreira, Nº 155 - Conj 909",
    addressLocality: "Itajaí",
    addressRegion: "SC",
    postalCode: "88301-030",
    addressCountry: "BR",
  },
} as const;

const WHATSAPP_MESSAGE =
  "Olá, quero falar com um especialista sobre importação premium de carros de luxo para o Brasil.";
const WHATSAPP_LINK = `https://wa.me/${COMPANY.phoneRaw}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

const THEME = {
  brandPrimary: "#1868FF",
  brandPrimaryStrong: "#0E52D9",
  brandSecondary: "#8FB4FF",
  bgPrimary: "#060B1B",
  bgSecondary: "#0B1430",
  bgTertiary: "#101D44",
  surface: "rgba(255,255,255,0.05)",
  surfaceStrong: "rgba(255,255,255,0.08)",
  textSoft: "rgba(255,255,255,0.80)",
  textMuted: "rgba(143,180,255,0.95)",
  textDim: "rgba(255,255,255,0.60)",
} as const;

type Item = {
  title: string;
  text: string;
};

type Step = {
  title: string;
  text: string;
};

type Stat = {
  value: string;
  label: string;
};

type Faq = {
  question: string;
  answer: string;
};

type GalleryItem = {
  src: string;
  alt: string;
  title: string;
};

const content = {
  seoTitle:
    "Importação Premium de Carros de Luxo para o Brasil | DMM Importação e Exportação",
  seoDescription:
    "Importação premium de carros de luxo para o Brasil com análise de viabilidade, coordenação internacional, atendimento consultivo e entrega legalizada.",
  heroEyebrow: "Importação premium de carros de luxo para o Brasil",
  heroTitle:
    "Importação premium de carros de luxo para o Brasil com discrição, segurança e entrega legalizada.",
  heroDescription:
    "A DMM conduz projetos de importação de carros de luxo para o Brasil com análise de viabilidade, coordenação internacional, organização documental e atendimento consultivo do início ao fim.",
  heroHighlights: [
    "Análise de viabilidade antes da compra",
    "Coordenação documental e logística",
    "Atendimento consultivo e reservado",
    "Entrega legalizada no Brasil",
  ],
  introTitle:
    "Uma operação premium exige mais do que desejo. Exige critério, estrutura e condução profissional.",
  introText: [
    "Importar um carro de luxo para o Brasil envolve análise técnica, documentação, logística internacional e decisões que precisam ser tomadas com clareza desde o início.",
    "Por isso, a DMM estrutura cada projeto com abordagem consultiva, organização operacional e acompanhamento profissional em todas as etapas críticas.",
    "O resultado é uma experiência mais segura, previsível e compatível com o nível de exigência de uma operação de alto valor.",
  ],
  benefitsTitle:
    "Por que esse serviço faz sentido para quem busca exclusividade com segurança",
  benefitsDescription:
    "A proposta não é apenas importar um carro. É conduzir uma operação sofisticada com mais previsibilidade, conveniência e proteção na tomada de decisão.",
  structureTitle:
    "Importação de carros de luxo com estrutura internacional e condução profissional",
  structureDescription:
    "Cada bloco abaixo foi desenhado para aumentar clareza, fortalecer SEO orgânico e facilitar a decisão do cliente sem exagero de promessa ou excesso de palavras genéricas.",
  processTitle:
    "Etapas da importação premium de carros de luxo com acompanhamento profissional",
  processDescription:
    "A operação é conduzida com visão de ponta a ponta para transformar um processo complexo em uma jornada mais clara, organizada e segura.",
  authorityTitle:
    "Mais de 20 anos de experiência em comércio exterior e operações internacionais",
  authorityDescription:
    "A experiência da DMM se traduz em leitura técnica, estrutura documental, coordenação logística e capacidade real de conduzir projetos de importação premium para o Brasil.",
  caseTitle:
    "Um case real que reforça autoridade, posicionamento e capacidade de execução",
  caseDescription:
    "A importação da Ferrari Purosangue associada ao Neymar reforça credibilidade, discrição operacional e capacidade de conduzir projetos premium de alta visibilidade.",
  faqTitle: "Perguntas frequentes sobre importação de carros de luxo",
  faqDescription:
    "Respostas diretas para trazer mais clareza a um processo que exige análise antes de qualquer decisão.",
  ctaTitle:
    "Solicite uma análise inicial e entenda a viabilidade da importação do seu próximo veículo",
  ctaDescription:
    "Se você busca exclusividade, segurança e execução correta, a conversa inicial precisa acontecer com quem entende a operação de ponta a ponta.",
} as const;

const trustCards: Item[] = [
  {
    title: "Atendimento premium",
    text: "Consultivo, reservado e personalizado para projetos de importação de alto padrão.",
  },
  {
    title: "Importação estruturada",
    text: "Análise, documentação, logística e coordenação internacional com mais segurança.",
  },
  {
    title: "Autoridade comprovada",
    text: "Experiência real em comércio exterior e projetos de importação premium no Brasil.",
  },
];

const benefits: Item[] = [
  {
    title: "Mais segurança para decidir",
    text: "Antes de qualquer avanço, a DMM analisa veículo, origem, documentação e viabilidade da importação para o Brasil.",
  },
  {
    title: "Menos ruído e retrabalho",
    text: "A condução estruturada reduz falhas de alinhamento, melhora a previsibilidade e organiza cada etapa com mais clareza.",
  },
  {
    title: "Mais conveniência ao longo do processo",
    text: "O cliente acompanha o projeto com suporte profissional, sem precisar enfrentar sozinho a complexidade documental e logística.",
  },
  {
    title: "Experiência premium de verdade",
    text: "Cada detalhe da jornada é pensado para refletir um serviço discreto, sólido e compatível com operações de alto valor.",
  },
];

const structureCards: Item[] = [
  {
    title: "Como funciona a importação de carros de luxo",
    text: "A importação de carros de luxo para o Brasil exige análise de viabilidade, documentação correta, coordenação logística e condução técnica em todas as etapas.",
  },
  {
    title: "O que influencia o custo da importação",
    text: "O custo varia conforme veículo, país de origem, disponibilidade, tributos, frete, seguro, documentação e características específicas do projeto.",
  },
  {
    title: "Por que a análise inicial é essencial",
    text: "Nem todo carro apresenta a mesma viabilidade. Uma análise bem feita evita decisões apressadas e reduz risco operacional.",
  },
];

const processSteps: Step[] = [
  {
    title: "Briefing e definição do projeto",
    text: "Tudo começa com a definição do veículo, do objetivo da importação, da origem pretendida e da faixa de investimento.",
  },
  {
    title: "Análise técnica e documental",
    text: "A DMM avalia procedência, documentação, disponibilidade, aderência do veículo e fatores relevantes para a viabilidade da operação.",
  },
  {
    title: "Planejamento da operação",
    text: "Após a validação inicial, a importação é estruturada com coordenação internacional, organização documental e acompanhamento das etapas críticas.",
  },
  {
    title: "Entrega legalizada no Brasil",
    text: "A condução segue até a etapa final com foco em conformidade, previsibilidade e entrega legalizada do veículo no Brasil.",
  },
];

const stats: Stat[] = [
  {
    value: "+20 anos",
    label: "de experiência em comércio exterior",
  },
  {
    value: "Operação completa",
    label: "da análise inicial à entrega legalizada",
  },
  {
    value: "Atendimento consultivo",
    label: "para importação premium de veículos",
  },
];

const proofItems: Stat[] = [
  {
    value: "Estrutura internacional",
    label: "coordenação documental e logística",
  },
  {
    value: "Análise de viabilidade",
    label: "mais segurança antes da compra",
  },
  {
    value: "Padrão premium",
    label: "discrição, clareza e execução correta",
  },
];

const gallery: GalleryItem[] = [
  {
    src: "/images/front.jpeg",
    alt: "Vista frontal de Ferrari Purosangue importada ao Brasil em projeto premium conduzido pela DMM",
    title: "",
  },
  {
    src: "/images/neymar-ferrari-traseira.jpeg",
    alt: "Vista traseira de Ferrari Purosangue em projeto de importação premium para o Brasil",
    title: "",
  },
];

const faqs: Faq[] = [
  {
    question: "É legal importar carro para o Brasil?",
    answer:
      "Sim, desde que a operação seja conduzida em conformidade com as exigências legais, técnicas e documentais aplicáveis. Por isso, cada projeto precisa passar por análise prévia de viabilidade.",
  },
  {
    question: "A DMM cuida de todo o processo?",
    answer:
      "A DMM conduz o projeto desde a análise inicial até a coordenação documental, logística internacional, acompanhamento operacional e entrega legalizada no Brasil.",
  },
  {
    question: "Quanto custa importar um carro de luxo?",
    answer:
      "O custo depende de fatores como veículo, origem, disponibilidade, frete, seguro, tributos, documentação e características específicas da operação.",
  },
  {
    question: "Quanto tempo leva para importar um veículo premium?",
    answer:
      "O prazo varia conforme o modelo, o país de origem, a disponibilidade do veículo e a dinâmica documental e logística do projeto.",
  },
  {
    question: "Nem todo carro pode ser importado?",
    answer:
      "Nem todo veículo apresenta a mesma viabilidade. Antes de avançar, é necessário validar o projeto sob os pontos de vista técnico, operacional e documental.",
  },
  {
    question: "Por que vale a pena contar com acompanhamento especializado?",
    answer:
      "Porque importar um carro premium é uma operação de alto valor e alta complexidade. O acompanhamento especializado reduz ruído, melhora a previsibilidade e protege a qualidade da decisão.",
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: content.seoTitle,
  description: content.seoDescription,
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "importação de carros de luxo",
    "importação premium de carros",
    "importação de veículos premium",
    "importar carro para o Brasil",
    "assessoria para importação de carros",
    "importação premium de veículos para o Brasil",
    "entrega legalizada no Brasil",
    "análise de viabilidade para importação de carro",
  ],
  openGraph: {
    title: content.seoTitle,
    description: content.seoDescription,
    url: PAGE_URL,
    siteName: COMPANY.brand,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Ferrari Purosangue importada ao Brasil em projeto conduzido pela DMM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: content.seoTitle,
    description: content.seoDescription,
    images: [OG_IMAGE],
  },
  category: "business",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY.name,
  legalName: COMPANY.name,
  url: SITE_URL,
  logo: `${SITE_URL}/logo/dmm-symbol.png`,
  telephone: COMPANY.phoneDisplay,
  email: COMPANY.email,
  address: {
    "@type": "PostalAddress",
    ...COMPANY.address,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: COMPANY.phoneDisplay,
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: ["Portuguese"],
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Importação premium de carros de luxo para o Brasil",
  serviceType: "Importação premium de carros de luxo",
  provider: {
    "@type": "Organization",
    name: COMPANY.name,
    url: SITE_URL,
  },
  areaServed: {
    "@type": "Country",
    name: "Brasil",
  },
  url: PAGE_URL,
  description: content.seoDescription,
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: COMPANY.brand,
  url: SITE_URL,
  inLanguage: "pt-BR",
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: content.seoTitle,
  url: PAGE_URL,
  description: content.seoDescription,
  inLanguage: "pt-BR",
  isPartOf: {
    "@type": "WebSite",
    name: COMPANY.brand,
    url: SITE_URL,
  },
  primaryImageOfPage: OG_IMAGE,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Início",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Importação de carros de luxo",
      item: PAGE_URL,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function ThemeStyles() {
  return (
    <style>{`
      :root {
        --brand-primary: ${THEME.brandPrimary};
        --brand-primary-strong: ${THEME.brandPrimaryStrong};
        --brand-secondary: ${THEME.brandSecondary};
        --bg-primary: ${THEME.bgPrimary};
        --bg-secondary: ${THEME.bgSecondary};
        --bg-tertiary: ${THEME.bgTertiary};
        --surface: ${THEME.surface};
        --surface-strong: ${THEME.surfaceStrong};
        --text-soft: ${THEME.textSoft};
        --text-muted: ${THEME.textMuted};
        --text-dim: ${THEME.textDim};
      }

      html {
        scroll-behavior: smooth;
      }
    `}</style>
  );
}

type BaseProps = PropsWithChildren<{ className?: string }>;

function Wrap({ children, className = "" }: BaseProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16 ${className}`}>
      {children}
    </div>
  );
}

function Surface({ children, className = "" }: BaseProps) {
  return (
    <div
      className={`rounded-[30px] border border-white/10 bg-[var(--surface)] shadow-[0_14px_45px_rgba(0,0,0,0.18)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight text-white md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-soft)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function PrimaryButton({
  href = WHATSAPP_LINK,
  children,
  ariaLabel,
}: PropsWithChildren<{ href?: string; ariaLabel?: string }>) {
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-6 py-4 text-base font-semibold text-white shadow-[0_16px_44px_rgba(24,104,255,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--brand-primary-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]"
    >
      {children}
    </a>
  );
}

function SecondaryButton({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-6 py-4 text-base font-medium text-white transition hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]"
    >
      {children}
    </a>
  );
}

function MiniIcon({ children }: PropsWithChildren) {
  return (
    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[var(--surface-strong)] text-white">
      {children}
    </div>
  );
}

function Card({
  title,
  text,
  icon,
  className = "",
}: {
  title: string;
  text: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Surface className={`min-h-[220px] p-7 md:p-8 ${className}`}>
      {icon ? <div className="mb-5">{icon}</div> : null}
      <h3 className="max-w-[14ch] text-2xl font-semibold leading-[1.15] text-white">
        {title}
      </h3>
      <p className="mt-4 max-w-[28ch] text-[15px] leading-8 text-[var(--text-soft)]">
        {text}
      </p>
    </Surface>
  );
}

function StatCard({ value, label }: Stat) {
  return (
    <Surface className="p-5">
      <div className="text-xl font-semibold text-white md:text-2xl">{value}</div>
      <div className="mt-2 text-sm leading-7 text-[var(--text-soft)]">{label}</div>
    </Surface>
  );
}

function FaqItem({
  question,
  answer,
  defaultOpen = false,
}: Faq & { defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[28px] border border-white/10 bg-[var(--surface)] p-6"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-white">
        <span>{question}</span>
        <span className="text-[var(--text-muted)] transition group-open:rotate-45">+</span>
      </summary>
      <p className="mt-4 text-sm leading-8 text-[var(--text-soft)] md:text-base">
        {answer}
      </p>
    </details>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5 12.5 9.2 17 19 7.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 3 5.5 5.5v5.6c0 4.2 2.6 8 6.5 9.9 3.9-1.9 6.5-5.7 6.5-9.9V5.5L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3.5 12h17M12 3c2.7 2.5 4.2 5.7 4.2 9S14.7 18.5 12 21c-2.7-2.5-4.2-5.7-4.2-9S9.3 5.5 12 3Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6L12 16.73 6.6 19.6l1.03-6L3.27 9.35l6.03-.88L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-7 w-7"
      fill="currentColor"
    >
      <path d="M19.11 17.35c-.27-.13-1.58-.78-1.82-.87-.24-.09-.41-.13-.59.14-.18.27-.68.87-.84 1.05-.15.18-.31.2-.58.07-.27-.13-1.12-.41-2.13-1.31-.79-.7-1.32-1.57-1.48-1.84-.15-.27-.02-.42.11-.55.12-.12.27-.31.41-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.59-1.43-.81-1.95-.21-.51-.42-.44-.59-.45h-.5c-.18 0-.47.07-.72.34-.24.27-.95.93-.95 2.26 0 1.32.97 2.6 1.11 2.78.13.18 1.9 2.9 4.6 4.07.64.28 1.14.45 1.53.58.64.2 1.22.17 1.68.1.51-.08 1.58-.65 1.8-1.28.23-.63.23-1.17.16-1.28-.06-.1-.24-.16-.51-.29Z" />
      <path d="M16.02 3.2c-6.95 0-12.59 5.63-12.59 12.58 0 2.22.58 4.39 1.68 6.3L3.2 28.8l6.89-1.81a12.52 12.52 0 0 0 5.93 1.5h.01c6.95 0 12.58-5.64 12.58-12.59 0-3.37-1.31-6.53-3.7-8.91A12.47 12.47 0 0 0 16.02 3.2Zm0 22.99h-.01c-1.88 0-3.73-.5-5.36-1.45l-.39-.23-4.08 1.07 1.09-3.98-.25-.41a10.3 10.3 0 0 1-1.58-5.45c0-5.67 4.61-10.29 10.3-10.29 2.75 0 5.34 1.07 7.28 3.01a10.23 10.23 0 0 1 3.01 7.28c0 5.68-4.62 10.3-10.31 10.3Z" />
    </svg>
  );
}

function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[rgba(6,11,27,0.94)] p-3 backdrop-blur md:hidden">
      <PrimaryButton
        href={WHATSAPP_LINK}
        ariaLabel="Falar com especialista pelo WhatsApp"
      >
        Falar com especialista no WhatsApp
      </PrimaryButton>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--bg-primary)] pb-24 text-white md:pb-0">
      <ThemeStyles />
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={webSiteJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <div
        className="absolute inset-x-0 top-0 -z-10 h-[840px] bg-[radial-gradient(circle_at_top_left,rgba(24,104,255,0.28),transparent_32%),radial-gradient(circle_at_top_right,rgba(143,180,255,0.14),transparent_22%),linear-gradient(180deg,#0B1430_0%,#060B1B_76%)]"
        aria-hidden="true"
      />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(6,11,27,0.78)] backdrop-blur">
        <Wrap className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
            <a
              href={PAGE_PATH}
              className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]"
              aria-label="DMM Importação e Exportação"
            >
              <Image
                src="/logo/dmm-symbol.png"
                alt="Logo da DMM Importação e Exportação"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                priority
              />
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-white/90">
                  DMM Importação e Exportação
                </p>
                <p className="text-xs text-[var(--text-soft)]">
                  Importação premium de veículos exclusivos
                </p>
              </div>
            </a>

            <nav className="hidden items-center gap-6 lg:flex">
              <a className="text-sm text-[var(--text-soft)] transition hover:text-white" href="#beneficios">
                Benefícios
              </a>
              <a className="text-sm text-[var(--text-soft)] transition hover:text-white" href="#estrutura">
                Estrutura
              </a>
              <a className="text-sm text-[var(--text-soft)] transition hover:text-white" href="#como-funciona">
                Como funciona
              </a>
              <a className="text-sm text-[var(--text-soft)] transition hover:text-white" href="#faq">
                FAQ
              </a>
            </nav>

            <PrimaryButton>Falar com especialista</PrimaryButton>
          </div>
        </Wrap>
      </header>

      <section aria-labelledby="hero-title">
        <Wrap className="py-16 md:py-24">
          <div className="grid gap-14 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/12 bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--text-muted)]">
                {content.heroEyebrow}
              </p>

              <h1
                id="hero-title"
                className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.02] md:text-6xl"
              >
                {content.heroTitle}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-soft)] md:text-xl">
                {content.heroDescription}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {content.heroHighlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-soft)]"
                  >
                    <MiniIcon>
                      <CheckIcon />
                    </MiniIcon>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <PrimaryButton>Falar com especialista agora</PrimaryButton>
                <SecondaryButton href="#como-funciona">
                  Entender o processo
                </SecondaryButton>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {proofItems.map((item) => (
                  <div
                    key={item.value}
                    className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                  >
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-[var(--brand-primary)]/20 blur-3xl" />
              <div className="absolute -right-6 bottom-8 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

              <Surface className="relative overflow-hidden p-5">
                <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="overflow-hidden rounded-[24px]">
                    <Image
                      src="/images/neymar.jpeg"
                      alt="Ferrari Purosangue importada ao Brasil em operação premium conduzida pela DMM"
                      width={1200}
                      height={1200}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="h-[560px] w-full rounded-[24px] object-cover"
                      priority
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <Surface className="p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                        Case emblemático
                      </p>
                      <h2 className="mt-4 text-2xl font-semibold leading-tight">
                        Ferrari Purosangue importada para Neymar
                      </h2>
                      <p className="mt-4 text-sm leading-8 text-[var(--text-soft)] md:text-base">
                        Um case de alta visibilidade que reforça capacidade operacional, condução estruturada e posicionamento no segmento de importação premium.
                      </p>
                    </Surface>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="overflow-hidden rounded-[22px]">
                        <Image
                          src="/images/front.jpeg"
                          alt="Vista frontal de Ferrari Purosangue importada ao Brasil"
                          width={800}
                          height={800}
                          sizes="(max-width: 1024px) 33vw, 12vw"
                          className="h-36 w-full rounded-[22px] object-cover"
                        />
                      </div>
                      <div className="overflow-hidden rounded-[22px]">
                        <Image
                          src="/images/neymar-ferrari-traseira.jpeg"
                          alt="Vista traseira de Ferrari Purosangue em projeto de importação premium"
                          width={800}
                          height={800}
                          sizes="(max-width: 1024px) 33vw, 12vw"
                          className="h-36 w-full rounded-[22px] object-cover"
                        />
                      </div>
                      <div className="overflow-hidden rounded-[22px]">
                        <Image
                          src="/images/neymar-jr-detail.jpeg"
                          alt="Detalhe personalizado do veículo em projeto de importação premium"
                          width={800}
                          height={800}
                          sizes="(max-width: 1024px) 33vw, 12vw"
                          className="h-36 w-full rounded-[22px] object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Surface>
            </div>
          </div>
        </Wrap>
      </section>

      <section aria-labelledby="trust-cards-title">
        <Wrap className="pb-14">
          <h2 id="trust-cards-title" className="sr-only">
            Diferenciais da DMM na importação premium de carros de luxo
          </h2>
          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {trustCards.map((item, index) => (
              <Card
                key={item.title}
                title={item.title}
                text={item.text}
                icon={
                  <MiniIcon>
                    {index === 0 ? <ShieldIcon /> : index === 1 ? <GlobeIcon /> : <StarIcon />}
                  </MiniIcon>
                }
              />
            ))}
          </div>
        </Wrap>
      </section>

      <section className="border-y border-white/8 bg-[var(--bg-secondary)]" aria-labelledby="intro-title">
        <Wrap className="py-18 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Posicionamento
              </p>
              <h2
                id="intro-title"
                className="mt-4 text-balance text-3xl font-semibold md:text-4xl"
              >
                {content.introTitle}
              </h2>
            </div>

            <div className="space-y-5 text-base leading-8 text-[var(--text-soft)]">
              {content.introText.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Wrap>
      </section>

      <section id="beneficios" aria-labelledby="beneficios-title">
        <Wrap className="py-18 md:py-20">
          <SectionHeading
            eyebrow="Benefícios"
            title={content.benefitsTitle}
            description={content.benefitsDescription}
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((item, index) => (
              <Card
                key={item.title}
                title={item.title}
                text={item.text}
                icon={
                  <MiniIcon>
                    {index === 0 ? <ShieldIcon /> : index === 1 ? <CheckIcon /> : index === 2 ? <GlobeIcon /> : <StarIcon />}
                  </MiniIcon>
                }
              />
            ))}
          </div>
        </Wrap>
      </section>

      <section
        id="estrutura"
        className="border-y border-white/8 bg-[var(--bg-secondary)]"
        aria-labelledby="estrutura-title"
      >
        <Wrap className="py-18 md:py-20">
          <SectionHeading
            eyebrow="Estrutura da operação"
            title={content.structureTitle}
            description={content.structureDescription}
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {structureCards.map((item) => (
              <Card key={item.title} title={item.title} text={item.text} />
            ))}
          </div>
        </Wrap>
      </section>

      <section
        id="como-funciona"
        className="border-y border-white/8 bg-[linear-gradient(180deg,rgba(11,20,51,0.95),rgba(7,15,43,1))]"
        aria-labelledby="como-funciona-title"
      >
        <Wrap className="py-20">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Como funciona
              </p>
              <h2
                id="como-funciona-title"
                className="mt-4 text-balance text-3xl font-semibold leading-tight text-white md:text-5xl"
              >
                {content.processTitle}
              </h2>
              <p className="mt-6 text-base leading-8 text-[var(--text-soft)] md:text-lg">
                {content.processDescription}
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm font-semibold text-white">Mais clareza para decidir</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                    O projeto é analisado antes da compra para reduzir ruído, alinhar expectativa e melhorar a tomada de decisão.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm font-semibold text-white">Mais previsibilidade na execução</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                    Cada etapa da operação é organizada com foco em documentação, coordenação logística e acompanhamento estruturado.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <PrimaryButton>Solicitar análise do veículo</PrimaryButton>
              </div>
            </div>

            <div className="space-y-5">
              {processSteps.map((step, index) => (
                <Surface
                  key={step.title}
                  className="group p-6 transition duration-300 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-base font-semibold text-white shadow-[0_10px_30px_rgba(24,104,255,0.25)]">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-semibold leading-tight text-white">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-8 text-[var(--text-soft)] md:text-base">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </Surface>
              ))}
            </div>
          </div>
        </Wrap>
      </section>

      <section aria-labelledby="autoridade-title">
        <Wrap className="py-18 md:py-20">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Surface className="p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Autoridade
              </p>
              <h2
                id="autoridade-title"
                className="mt-4 text-balance text-3xl font-semibold md:text-4xl"
              >
                {content.authorityTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--text-soft)]">
                {content.authorityDescription}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <StatCard key={item.value} {...item} />
                ))}
              </div>
            </Surface>

            <Surface className="border-[var(--brand-primary)]/20 bg-[linear-gradient(180deg,rgba(24,104,255,0.10),rgba(24,104,255,0.05))] p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Atendimento
              </p>
              <h3 className="mt-4 text-balance text-2xl font-semibold md:text-3xl">
                Um serviço pensado para quem valoriza conveniência, discrição e execução correta.
              </h3>
              <p className="mt-4 text-sm leading-8 text-[var(--text-soft)] md:text-base">
                Em vez de enfrentar sozinho um processo complexo, o cliente conta com uma estrutura profissional para avaliar a viabilidade e conduzir a operação com mais segurança.
              </p>
              <div className="mt-8">
                <PrimaryButton>Iniciar atendimento</PrimaryButton>
              </div>
            </Surface>
          </div>
        </Wrap>
      </section>

      <section className="border-y border-white/8 bg-[var(--bg-secondary)]" aria-labelledby="case-title">
        <Wrap className="py-18 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Case real"
                title={content.caseTitle}
                description={content.caseDescription}
              />

              <div className="mt-8 max-w-xl space-y-4 text-base leading-8 text-[var(--text-soft)]">
                <p>
                  Projetos reais reforçam confiança, autoridade e a capacidade de execução em operações de alto nível.
                </p>
                <p>
                  Esse tipo de operação evidencia organização, experiência internacional e padrão elevado de condução.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="mx-auto max-w-3xl">
                <Surface className="p-3">
                  <video
                    src="/videos/neymar8.mp4"
                    controls
                    playsInline
                    preload="metadata"
                    poster="/images/neymar-ferrari-front.jpeg"
                    className="aspect-video w-full rounded-[22px] object-cover"
                  />
                </Surface>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {gallery.map((item) => (
                  <Surface key={`${item.title}-${item.src}`} className="overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={1200}
                      height={800}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="h-[250px] w-full object-cover"
                    />
                    <div className="p-5">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                    </div>
                  </Surface>
                ))}
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      <section id="faq" aria-labelledby="faq-title">
        <Wrap className="py-18 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <SectionHeading
                eyebrow="Perguntas frequentes"
                title={content.faqTitle}
                description={content.faqDescription}
              />
              <div className="mt-8 space-y-4">
                {faqs.map((item, index) => (
                  <FaqItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                    defaultOpen={index === 0}
                  />
                ))}
              </div>
            </div>

            <Surface className="bg-[linear-gradient(180deg,rgba(18,26,60,0.95),rgba(7,11,30,1))] p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Próximo passo
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold md:text-4xl">
                {content.ctaTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--text-soft)]">
                {content.ctaDescription}
              </p>

              <Surface className="mt-8 bg-black/20 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Atendimento via WhatsApp
                </p>
                <p className="mt-4 text-2xl font-semibold leading-tight">
                  Receba uma análise inicial clara e objetiva para entender a viabilidade do seu projeto.
                </p>
                <div className="mt-8">
                  <PrimaryButton>Falar com especialista</PrimaryButton>
                </div>
              </Surface>
            </Surface>
          </div>
        </Wrap>
      </section>

      <a
        href={WHATSAPP_LINK}
        aria-label="Abrir conversa no WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-5 z-40 hidden min-h-14 min-w-14 items-center justify-center rounded-full bg-[#25D366] p-4 text-white shadow-[0_12px_35px_rgba(37,211,102,0.42)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] md:inline-flex"
      >
        <span className="sr-only">Falar com especialista no WhatsApp</span>
        <WhatsAppIcon />
      </a>

      <footer className="border-t border-white/8 bg-[var(--bg-primary)]/90">
        <Wrap className="flex flex-col gap-4 py-8 text-sm text-[var(--text-dim)] lg:flex-row lg:items-center lg:justify-between">
          <p>
            Todos os direitos reservados a {COMPANY.name} •{" "}
            {COMPANY.address.streetAddress} • {COMPANY.address.addressLocality} -{" "}
            {COMPANY.address.addressRegion} • CEP {COMPANY.address.postalCode}
          </p>
          <div className="flex flex-col gap-1 text-left lg:text-right">
            <p>{COMPANY.phoneDisplay}</p>
            <p>{COMPANY.email}</p>
          </div>
        </Wrap>
      </footer>

      <StickyMobileCta />
    </main>
  );
}