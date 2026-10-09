import type { Metadata } from 'next';
import { Roboto, Roboto_Serif } from 'next/font/google';
import './globals.css';

const roboto = Roboto({ subsets: ['latin'], variable: '--font-roboto' });
const robotoSerif = Roboto_Serif({ subsets: ['latin'], variable: '--font-roboto-serif' });

export const metadata: Metadata = {
  title: 'TraderLab Gestão',
  description: 'Ambiente de gestão do TraderLab.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${roboto.variable} ${robotoSerif.variable}`}>{children}</body>
    </html>
  );
}
