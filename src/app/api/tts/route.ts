import { NextResponse } from "next/server";

/** Deep male ElevenLabs voice — Adam */
const DEEP_MALE_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

const MODEL_ID = "eleven_multilingual_v2";

function getApiKey(): string | undefined {
  return (
    process.env.ELEVENLABS_API_KEY ||
    process.env.VITE_TTS_API_KEY ||
    process.env.TTS_API_KEY
  );
}

export async function POST(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing ELEVENLABS_API_KEY. Add it to .env.local (see env.example).",
      },
      { status: 500 },
    );
  }

  let text = "";
  try {
    const body = (await request.json()) as { text?: string };
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!text || text.length > 80) {
    return NextResponse.json(
      { error: "text is required (max 80 chars)" },
      { status: 400 },
    );
  }

  const elevenRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${DEEP_MALE_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.88,
          similarity_boost: 0.22,
          style: 0.05,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!elevenRes.ok) {
    const detail = await elevenRes.text().catch(() => "");
    return NextResponse.json(
      { error: "ElevenLabs request failed", detail },
      { status: elevenRes.status },
    );
  }

  const audio = await elevenRes.arrayBuffer();
  return new NextResponse(audio, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
