import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ExoApi Workbench — API de Projetos e Código .NET / SSMS',
  description:
    'Bancada interativa para desenvolvimento e teste no navegador da API REST ExoApi (Projetos CRUD), com banco SQL pré-populado e arquivos C# (.NET 6/7) e cria-db.sql.',
  openGraph: {
    title: 'ExoApi Workbench — API de Projetos e Código .NET / SSMS',
    description:
      'Teste endpoints GET, POST, PUT e DELETE em /api/projetos diretamente no navegador e exporte o projeto Exo.WebApi em C# e SQL.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExoApi Workbench — API de Projetos e Código .NET / SSMS',
    description:
      'Teste endpoints GET, POST, PUT e DELETE em /api/projetos diretamente no navegador e exporte o projeto Exo.WebApi em C# e SQL.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#2563EB]/15 selection:text-[#1D4ED8]"
      >
        {children}
      </body>
    </html>
  );
}
