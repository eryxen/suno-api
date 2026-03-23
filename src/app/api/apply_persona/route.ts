import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers';
import { DEFAULT_MODEL, sunoApi } from "@/lib/SunoApi";
import { corsHeaders } from "@/lib/utils";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { clip_id, persona_id, prompt, tags, title, model, wait_audio } = body;
      if (!clip_id || !persona_id) {
        return new NextResponse(JSON.stringify({ error: 'clip_id and persona_id are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      const audioInfo = await (await sunoApi((await cookies()).toString())).applyVoxPersona(
        clip_id,
        persona_id,
        prompt || '',
        tags || '',
        title || '',
        model || DEFAULT_MODEL,
        Boolean(wait_audio)
      );
      return new NextResponse(JSON.stringify(audioInfo), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error: any) {
      console.error('Error applying vox persona:', error);
      return new NextResponse(JSON.stringify({ error: error.response?.data?.detail || error.toString() }), {
        status: error.response?.status || 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  } else {
    return new NextResponse('Method Not Allowed', {
      headers: { Allow: 'POST', ...corsHeaders },
      status: 405
    });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 200, headers: corsHeaders });
}
