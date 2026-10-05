export type DemoContent = {
  id: string;
  title: string;
  description: string;
  kind: 'Curso' | 'Módulo' | 'Aula';
  course: string;
};

export const demoBanners = [
  {
    image: '/banners/estudo.svg',
    eyebrow: 'Aprenda com método',
    title: 'Conhecimento se constrói com consistência.',
    detail: 'Um passo de cada vez, no seu ritmo.',
  },
  {
    image: '/banners/analise.svg',
    eyebrow: 'Estude com clareza',
    title: 'Entenda o contexto antes de agir.',
    detail: 'Conteúdo para apoiar decisões mais conscientes.',
  },
  {
    image: '/banners/progresso.svg',
    eyebrow: 'Seu aprendizado',
    title: 'Seu próximo passo começa aqui.',
    detail: 'Retome seus estudos sempre que quiser.',
  },
];

export const demoCatalog: DemoContent[] = [
  {
    id: 'curso-analise-tecnica',
    title: 'Fundamentos da Análise Técnica',
    description: 'Aprenda a ler gráficos e reconhecer estruturas de mercado.',
    kind: 'Curso',
    course: 'Fundamentos da Análise Técnica',
  },
  {
    id: 'modulo-tendencias',
    title: 'Tendências e estruturas',
    description: 'Módulo sobre tendência, suporte e resistência.',
    kind: 'Módulo',
    course: 'Fundamentos da Análise Técnica',
  },
  {
    id: 'aula-suporte-resistencia',
    title: 'Suporte e resistência na prática',
    description: 'Aula sobre zonas de preço e leitura de contexto.',
    kind: 'Aula',
    course: 'Fundamentos da Análise Técnica',
  },
  {
    id: 'curso-gestao-risco',
    title: 'Gestão de Risco',
    description: 'Conceitos para entender exposição e planejamento.',
    kind: 'Curso',
    course: 'Gestão de Risco',
  },
  {
    id: 'aula-plano-operacional',
    title: 'Como estruturar um plano operacional',
    description: 'Aula introdutória sobre rotina e plano de estudo.',
    kind: 'Aula',
    course: 'Gestão de Risco',
  },
  {
    id: 'aula-contexto-mercado',
    title: 'Leitura de contexto de mercado',
    description: 'Aula de exemplo para observar cenários e estruturas.',
    kind: 'Aula',
    course: 'Fundamentos da Análise Técnica',
  },
];

export const demoRecent = [
  {
    id: 'aula-suporte-resistencia',
    title: 'Suporte e resistência na prática',
    course: 'Fundamentos da Análise Técnica',
    progress: 68,
    time: 'Acessado recentemente',
  },
  {
    id: 'aula-plano-operacional',
    title: 'Como estruturar um plano operacional',
    course: 'Gestão de Risco',
    progress: 24,
    time: 'Acessado ontem',
  },
  {
    id: 'aula-contexto-mercado',
    title: 'Leitura de contexto de mercado',
    course: 'Fundamentos da Análise Técnica',
    progress: 100,
    time: 'Acessado nesta semana',
  },
];

export const demoCourses = [
  {
    id: 'curso-analise-tecnica',
    title: 'Fundamentos da Análise Técnica',
    description: 'Aprenda a ler gráficos e reconhecer estruturas de mercado.',
    image: '/banners/analise.svg',
    progress: 42,
    label: '8 de 19 aulas',
  },
  {
    id: 'curso-gestao-risco',
    title: 'Gestão de Risco',
    description: 'Conceitos para estudar exposição e planejamento.',
    image: '/banners/progresso.svg',
    progress: 18,
    label: '2 de 11 aulas',
  },
];
