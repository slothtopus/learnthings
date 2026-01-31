import { z } from "zod";

// https://docs.cloud.google.com/text-to-speech/docs/gemini-tts#voice_options

import { config, throwIfUndefined } from "../config";


export const VOICES = [
  "Achernar",
  "Achird",
  "Algenib",
  "Algieba",
  "Alnilam",
  "Aoede",
  "Autonoe",
  "Callirrhoe",
  "Charon",
  "Despina",
  "Enceladus",
  "Erinome",
  "Fenrir",
  "Gacrux",
  "Iapetus",
  "Kore",
  "Laomedeia",
  "Leda",
  "Orus",
  "Pulcherrima",
  "Puck",
  "Rasalgethi",
  "Sadachbia",
  "Sadaltager",
  "Schedar",
  "Sulafat",
  "Umbriel",
  "Vindemiatrix",
  "Zephyr",
  "Zubenelgenubi",
] as const;
export const GeminiTtsVoiceNameSchema = z.enum(VOICES);

export const LANGUAGES = {
  // GA
  "ar-EG": "Arabic (Egypt)",
  "bn-BD": "Bengali (Bangladesh)",
  "nl-NL": "Dutch (Netherlands)",
  "en-IN": "English (India)",
  "en-US": "English (United States)",
  "fr-FR": "French (France)",
  "de-DE": "German (Germany)",
  "hi-IN": "Hindi (India)",
  "id-ID": "Indonesian (Indonesia)",
  "it-IT": "Italian (Italy)",
  "ja-JP": "Japanese (Japan)",
  "ko-KR": "Korean (South Korea)",
  "mr-IN": "Marathi (India)",
  "pl-PL": "Polish (Poland)",
  "pt-BR": "Portuguese (Brazil)",
  "ro-RO": "Romanian (Romania)",
  "ru-RU": "Russian (Russia)",
  "es-ES": "Spanish (Spain)",
  "ta-IN": "Tamil (India)",
  "te-IN": "Telugu (India)",
  "th-TH": "Thai (Thailand)",
  "tr-TR": "Turkish (Turkey)",
  "uk-UA": "Ukrainian (Ukraine)",
  "vi-VN": "Vietnamese (Vietnam)",

  // Preview
  "af-ZA": "Afrikaans (South Africa)",
  "sq-AL": "Albanian (Albania)",
  "am-ET": "Amharic (Ethiopia)",
  "ar-001": "Arabic (Modern Standard)",
  "hy-AM": "Armenian (Armenia)",
  "az-AZ": "Azerbaijani (Azerbaijan)",
  "eu-ES": "Basque (Spain)",
  "be-BY": "Belarusian (Belarus)",
  "bg-BG": "Bulgarian (Bulgaria)",
  "my-MM": "Burmese (Myanmar)",
  "ca-ES": "Catalan (Spain)",
  "ceb-PH": "Cebuano (Philippines)",
  "cmn-CN": "Mandarin Chinese (Simplified, China)",
  "cmn-tw": "Mandarin Chinese (Traditional, Taiwan)",
  "hr-HR": "Croatian (Croatia)",
  "cs-CZ": "Czech (Czech Republic)",
  "da-DK": "Danish (Denmark)",
  "en-AU": "English (Australia)",
  "en-GB": "English (United Kingdom)",
  "et-EE": "Estonian (Estonia)",
  "fil-PH": "Filipino (Philippines)",
  "fi-FI": "Finnish (Finland)",
  "fr-CA": "French (Canada)",
  "gl-ES": "Galician (Spain)",
  "ka-GE": "Georgian (Georgia)",
  "el-GR": "Greek (Greece)",
  "gu-IN": "Gujarati (India)",
  "ht-HT": "Haitian Creole (Haiti)",
  "he-IL": "Hebrew (Israel)",
  "hu-HU": "Hungarian (Hungary)",
  "is-IS": "Icelandic (Iceland)",
  "jv-JV": "Javanese",
  "kn-IN": "Kannada (India)",
  "kok-IN": "Konkani (India)",
  "lo-LA": "Lao (Laos)",
  "la-VA": "Latin",
  "lv-LV": "Latvian (Latvia)",
  "lt-LT": "Lithuanian (Lithuania)",
  "lb-LU": "Luxembourgish (Luxembourg)",
  "mk-MK": "Macedonian (North Macedonia)",
  "mai-IN": "Maithili (India)",
  "mg-MG": "Malagasy (Madagascar)",
  "ms-MY": "Malay (Malaysia)",
  "ml-IN": "Malayalam (India)",
  "mn-MN": "Mongolian (Mongolia)",
  "ne-NP": "Nepali (Nepal)",
  "nb-NO": "Norwegian Bokmål (Norway)",
  "nn-NO": "Norwegian Nynorsk (Norway)",
  "or-IN": "Odia (India)",
  "ps-AF": "Pashto (Afghanistan)",
  "fa-IR": "Persian (Iran)",
  "pt-PT": "Portuguese (Portugal)",
  "pa-IN": "Punjabi (India)",
  "sr-RS": "Serbian (Serbia)",
  "sd-IN": "Sindhi (India)",
  "si-LK": "Sinhala (Sri Lanka)",
  "sk-SK": "Slovak (Slovakia)",
  "sl-SI": "Slovenian (Slovenia)",
  "es-419": "Spanish (Latin America)",
  "es-MX": "Spanish (Mexico)",
  "sw-KE": "Swahili (Kenya)",
  "sv-SE": "Swedish (Sweden)",
  "ur-PK": "Urdu (Pakistan)",
} as const;

export const GeminiTtsLanguageCodeSchema = z.enum(
  Object.keys(LANGUAGES) as Array<keyof typeof LANGUAGES>,
);

export const GeminiTtsRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  languageCode: GeminiTtsLanguageCodeSchema,
  voiceName: GeminiTtsVoiceNameSchema.optional(),
  ssml: z.boolean().optional().default(false),
  audioEncoding: z
    .enum(["MP3", "OGG_OPUS", "LINEAR16"])
    .optional()
    .default("MP3"),
  speakingRate: z.number().min(0.25).max(4.0).optional(),
  pitch: z.number().min(-20).max(20).optional(),
  volumeGainDb: z.number().min(-96).max(16).optional(),
});

export type GeminiTtsRequestInput =
  z.input<typeof GeminiTtsRequestSchema>;
export type GeminiTtsRequest = z.infer<typeof GeminiTtsRequestSchema>;

export async function generateTextToSpeech(
  opts: GeminiTtsRequestInput,
  timeoutMs = 30_000,
): Promise<{ audio: Buffer; contentType: string }> {
  const GENERATION_API_URL = throwIfUndefined(config.GENERATION_API_URL)
  const tokenGenerator = throwIfUndefined(config.tokenGenerator)

  const token = await tokenGenerator()
  if(token === undefined) {
    throw new Error('Could not create Generation API token')
  }

  const url = new URL("/tts", GENERATION_API_URL);
  url.searchParams.set("raw", "1");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url.toString(), {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(opts),
    });

    if (!resp.ok) {
      // Try to read JSON error from your backend; fall back to text.
      let detail: any = undefined;
      const ct = resp.headers.get("content-type") ?? "";
      try {
        detail = ct.includes("application/json")
          ? await resp.json()
          : await resp.text();
      } catch {
        // ignore
      }
      const msg =
        typeof detail === "string"
          ? detail
          : detail?.message || detail?.error || `HTTP ${resp.status}`;
      throw new Error(`TTS request failed: ${msg}`);
    }

    const arrayBuf = await resp.arrayBuffer();
    const audio = Buffer.from(arrayBuf);
    const contentType =
      resp.headers.get("content-type") ?? "application/octet-stream";

    return { audio, contentType };
  } finally {
    clearTimeout(timeout);
  }
}
