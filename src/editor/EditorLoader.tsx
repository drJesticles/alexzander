'use client';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('./WebForgeEditor'), { ssr: false, loading: () => <div className="p-8 muted text-sm">Loading editor…</div> });
export default function EditorLoader({ id }: { id: string }) { return <Editor id={id} />; }
