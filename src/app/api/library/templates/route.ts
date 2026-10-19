import { NextResponse } from 'next/server';
import { listTemplates } from '@/lib/library';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(await listTemplates()); }
