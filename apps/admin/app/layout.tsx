import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TraderLab Gestão',
  description: 'Ambiente de gestão do TraderLab.',
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
