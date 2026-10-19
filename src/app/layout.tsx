import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduTrack — Intelligent Multimodal Lecture Perception & Synchronized Presentations',
  description:
    'Transforms lecture footage into an intelligent, synchronized learning experience with auto-generated presentations, equations, and diagrams.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('edutrack_theme') || localStorage.getItem('synchroslide_theme');
                if (stored === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-neutral-500/20 selection:text-foreground">
        {children}
      </body>
    </html>
  );
}
