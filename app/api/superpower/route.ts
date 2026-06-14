import { NextResponse } from 'next/server';
import { runSupervisorAgent } from '@/agents/manage';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    
    // Call the structured Claude Agent framework
    const agentOutput = await runSupervisorAgent({ task: message, history });
    
    return NextResponse.json(agentOutput);
  } catch (error) {
    return NextResponse.json({ error: 'Agent execution failed' }, { status: 500 });
  }
}