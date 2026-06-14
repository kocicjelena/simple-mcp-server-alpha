/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { proposeApplicationPatch } from '@/agents/orchestrator';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { feedback, previousCode } = body;
    
    // Request an updated layout fix based on feedback history tracking parameters
    const proposal = await proposeApplicationPatch({ feedback, previousCode });
    return NextResponse.json(proposal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
