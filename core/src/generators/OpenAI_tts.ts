import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    "...",
  dangerouslyAllowBrowser: true,
});

type Locale = "pt-PT" | "pt-BR" | "en-GB" | "en-US" | "es-ES" | "fr-FR";

export const LOCALE_INSTRUCTIONS: Record<Locale, string> = {
  "pt-PT": `
Speak in European Portuguese.
Use European Portuguese pronunciation, vocabulary, and grammar.
Avoid Brazilian pronunciation, vocabulary, or intonation.
`,

  "pt-BR": `
Speak in Brazilian Portuguese.
Use Brazilian Portuguese pronunciation, vocabulary, and intonation.
Avoid European Portuguese forms.
`,

  "en-GB": `
Speak in British English with British pronunciation and spelling.
`,

  "en-US": `
Speak in American English.
`,

  "es-ES": `
Speak in European Spanish (Castilian).
`,

  "fr-FR": `
Speak in Metropolitan French.
`,
};

type TTSOptions = {
  text: string;
  locale: Locale;
  outFile: string;
  voice?: "alloy" | "nova" | "shimmer" | "onyx";
  format?: "mp3" | "wav";
};

/**
 * Generate speech with explicit locale control
 */
export async function generateSpeech({
  text,
  locale,
  outFile,
  voice = "alloy",
}: TTSOptions): Promise<Uint8Array<ArrayBuffer>> {
  const instruction = LOCALE_INSTRUCTIONS[locale];

  const input = `
INSTRUCTIONS ONLY. DO NOT SPEAK THIS.  
${instruction}

Text to speak:
"""${text}"""
`;

  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice,
    input,
    response_format: "mp3",
  });

  const ab = await response.arrayBuffer();
  const audio = new Uint8Array(ab);

  return audio;
}

export async function generateAudioFromPrompt(
  text: string,
  prompt: string,
  voice = "alloy",
): Promise<Uint8Array<ArrayBuffer>> {
  const input = `
${prompt}

Text to speak:
"""${text}"""
`;

  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice,
    input,
    response_format: "mp3",
  });

  const ab = await response.arrayBuffer();
  const audio = new Uint8Array(ab);

  return audio;
}
