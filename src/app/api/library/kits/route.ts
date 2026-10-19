import { NextResponse } from 'next/server';
import { listKits } from '@/lib/library';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(await listKits()); }
