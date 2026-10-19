import ProjectsList from '@/components/ProjectsList';
import NewProjectButton from '@/components/NewProjectButton';
import { listKits } from '@/lib/library';
export const dynamic = 'force-dynamic';
export default async function Projects() {
  const kits = await listKits();
  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Projects</h1><NewProjectButton label="New blank project" accent /></div>
      <ProjectsList kits={kits.map(k => k.slug)} />
    </div>
  );
}
