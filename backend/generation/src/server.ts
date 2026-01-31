import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";

import { z } from "zod";
import textToSpeech from "@google-cloud/text-to-speech";

import { requireFirebaseAuth } from "./auth.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],
  credentials: false,
  maxAge: 86400,
});


// https://docs.cloud.google.com/text-to-speech/docs/gemini-tts
const ttsClient = new textToSpeech.TextToSpeechClient();

// ---- Input schema ----
const TtsBodySchema = z.object({
  text: z.string().min(1).max(5000),
  languageCode: z.string().min(2).default("en-GB"),
  voiceName: z.string().optional(),
  ssml: z.boolean().optional().default(false),
  speakingRate: z.number().min(0.25).max(4.0).optional(),
  pitch: z.number().min(-20).max(20).optional(),
  volumeGainDb: z.number().min(-96).max(16).optional(),
});

fastify.get("/healthz", async () => ({ ok: true }));

fastify.post(
  "/tts",
  { preHandler: [requireFirebaseAuth] },
  async (request, reply) => {
    const raw = (request.query as any)?.raw === "1";

    const parsed = TtsBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const body = parsed.data;

    const input = body.ssml
      ? { ssml: body.text } // treat `text` as SSML string if ssml=true
      : { text: body.text };

    const voice = {
      languageCode: body.languageCode,
      ...(body.voiceName ? { name: body.voiceName } : {}),
    };

    const audioConfig: any = {
      audioEncoding: "MP3",
      ...(body.speakingRate !== undefined
        ? { speakingRate: body.speakingRate }
        : {}),
      ...(body.pitch !== undefined ? { pitch: body.pitch } : {}),
      ...(body.volumeGainDb !== undefined
        ? { volumeGainDb: body.volumeGainDb }
        : {}),
    };

    try {
      const [resp] = await ttsClient.synthesizeSpeech({
        input,
        voice: { modelName: "gemini-2.5-flash-tts", languageCode: body.languageCode, name: body.voiceName },
        audioConfig,
      });

      if (!resp.audioContent) {
        return reply
          .code(502)
          .send({ error: "No audioContent returned from Google TTS" });
      }

      const audioBuffer = Buffer.isBuffer(resp.audioContent)
        ? resp.audioContent
        : Buffer.from(resp.audioContent as any);

      if (raw) {
        reply.header("Content-Type", "audio/mpeg");
        reply.header("Cache-Control", "no-store");
        return reply.send(audioBuffer);
      }

      return reply.send({
        contentType: "audio/mpeg",
        audioBase64: audioBuffer.toString("base64"),
        // helpful for client-side sizing / debugging
        bytes: audioBuffer.length,
      });
    } catch (err: any) {
      request.log.error({ err }, "Google TTS synthesizeSpeech failed");
      const status = typeof err?.code === "number" ? 502 : 500;
      return reply.code(status).send({
        error: "TTS request failed",
        message: err?.message ?? String(err),
      });
    }
  },
);

async function main() {
  const port = Number(process.env.PORT ?? 5001);
  const host = process.env.HOST ?? "0.0.0.0";
  await fastify.listen({ port, host });
}

main().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
