import type { Metadata } from 'next';
import { NavigationFeedback } from '../components/navigation/NavigationFeedback';
import './globals.css';

export const metadata: Metadata = {
  title: 'TraderLab — Aprenda com método',
  description: 'Acesse sua área de aprendizagem do TraderLab.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <NavigationFeedback />
      </body>
    </html>
  );
}
