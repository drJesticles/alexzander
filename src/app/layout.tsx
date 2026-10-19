import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { libraryCounts } from '@/lib/library';

export const metadata: Metadata = { title: 'WebForge', description: 'Self-hosted site builder and template library' };
export const dynamic = 'force-dynamic';

const NAV = [
  ['/', 'Dashboard'], ['/templates', 'Templates'], ['/components', 'Components'], ['/kits', 'Design kits'], ['/projects', 'Projects'], ['/settings', 'Settings'],
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await libraryCounts();
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-[var(--app-border)] bg-[var(--app-panel)] p-4 gap-1 sticky top-0 h-screen">
            <Link href="/" className="font-bold text-lg tracking-tight mb-3 flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[var(--app-accent)]" />WebForge</Link>
            {NAV.map(([href, label]) => <Link key={href} href={href} className="px-3 py-2 rounded-lg text-sm hover:bg-[var(--app-panel-2)]">{label}</Link>)}
            <div className="mt-auto text-xs muted leading-5">
              <div>{c.templates} templates</div><div>{c.components} components · {c.categories} categories</div><div>{c.kits} design kits</div>
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="md:hidden flex gap-3 p-3 border-b border-[var(--app-border)] text-sm overflow-x-auto">{NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
