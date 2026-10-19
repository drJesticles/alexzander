import EditorLoader from '@/editor/EditorLoader';
export const dynamic = 'force-dynamic';
export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditorLoader id={id} />;
}
