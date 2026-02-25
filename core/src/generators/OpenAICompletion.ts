import OpenAI from "openai";
import {
  PersistableObject,
  PersistedObject,
} from "../object_manager/PersistableObject";
import { ObjectManager } from "../object_manager/ObjectManager";

export type SerialisedOpenAiChatCompletion = PersistedObject & {
  apiKey: string;
};

export class OpenAiChatCompletion extends PersistableObject<SerialisedOpenAiChatCompletion> {
  static createNew(
    objectManager: ObjectManager,
    options: {
      apiKey: string;
    },
  ) {
    return new OpenAiChatCompletion(
      { ...PersistableObject.create("open-chat-completion"), ...options },
      objectManager,
    );
  }

  apiKey?: string;

  constructor(
    serialised: SerialisedOpenAiChatCompletion,
    objectManager: ObjectManager,
  ) {
    super(serialised, objectManager);
    const { apiKey } = serialised;
    this.apiKey = apiKey;
  }

  shouldDelete(): boolean {
    return super.shouldDelete() || this.apiKey === undefined;
  }

  serialise(...args: Parameters<PersistableObject<any>["serialise"]>) {
    return {
      ...super.serialise(...args),
      apiKey: this.apiKey,
    };
  }

  requiresConfig() {
    return this.apiKey === undefined;
  }

  setApiKey(apiKey: string) {
    if (this.apiKey !== apiKey) {
      this.apiKey = apiKey;
      this.markDirty();
    }
  }

  async chatCompletion(
    prompt: string,
    options?: {
      model?: string;
      system?: string;
      temperature?: number;
    },
  ): Promise<string> {
    if (this.apiKey === undefined) {
      throw new Error("api key is undefined");
    }
    const openai = new OpenAI({
      apiKey: this.apiKey,
    });

    const response = await openai.chat.completions.create({
      model: options?.model ?? "gpt-4o-mini",
      temperature: options?.temperature ?? 0.7,
      messages: [
        ...(options?.system
          ? [{ role: "system" as const, content: options.system }]
          : []),
        { role: "user", content: prompt },
      ],
    });

    const message = response.choices[0]?.message?.content;
    if (!message) {
      throw new Error("No response from OpenAI");
    }

    return message;
  }
}
