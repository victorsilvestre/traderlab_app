import './styles.css';
export const metadata = { title: 'TraderLab', description: 'Registro, análise e estudo do trader' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }

