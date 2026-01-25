import { test } from "vitest";
import { generateSpeech } from "./OpenAI_tts";

import { writeFile } from "node:fs/promises";

test("audio generation", async () => {
  const audio = await generateSpeech({
    text: "Era assim mesmo que eu queria! Será preciso muito capim para esse carneiro?",
    locale: "pt-PT",
    outFile: "generate.mp3",
    voice: "nova",
  });

  await writeFile("generate.mp3", audio);
});
