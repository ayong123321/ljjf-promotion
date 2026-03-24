import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '假发推广平台',
    template: '%s',
  },
  description: '专业假发推广平台，品质保证，欢迎咨询',
  keywords: [
    '假发',
    '假发店',
    '发片',
    '补发',
  ],
  authors: [{ name: 'Admin' }],
  openGraph: {
    title: '假发推广平台',
    description: '专业假发推广平台，品质保证，欢迎咨询',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
