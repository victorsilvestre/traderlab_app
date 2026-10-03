import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TraderLab — Aprenda com método',
  description: 'Acesse sua área de aprendizagem do TraderLab.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
