/* eslint-disable @typescript-eslint/no-explicit-any */
import { proposeApplicationPatch } from '@/agents/orch';
import { NextResponse } from 'next/server';
//import { proposeApplicationPatch } from '@/agents/orchestrator';

export async function POST() {
  try {
    const proposal = await proposeApplicationPatch();
    return NextResponse.json(proposal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
