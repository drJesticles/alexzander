import path from 'node:path';

export const ROOT = process.cwd();
export const LIBRARY_DIR = process.env.WEBFORGE_LIBRARY_DIR || path.join(ROOT, 'library');
export const DATA_DIR = path.resolve(process.env.WEBFORGE_DATA_DIR || path.join(ROOT, 'data'));
export const USER_KITS_DIR = path.join(DATA_DIR, 'kits');
export const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
export const SITES_DIR = path.join(DATA_DIR, 'sites');
export const SECRETS_FILE = process.env.WEBFORGE_SECRETS_FILE || path.join(process.env.HOME || '/root', '.drJesticles', 'webforge.env');

export function safeSlug(s: string): string {
  return String(s || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'untitled';
}
