import { NextResponse } from "next/server";
import { generateImageFromPrompt } from "@/lib/openai";
import {
  sendImageMessage,
  sendTextMessage,
  uploadImage,
} from "@/lib/whatsapp";

export const runtime = "nodejs";

type BaseMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: string;
};

type TextMessage = BaseMessage & {
  type: "text";
  text: { body: string };
};

type WhatsAppMessage = TextMessage | (BaseMessage & Record<string, unknown>);

type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
        messages?: WhatsAppMessage[];
      };
    }>;
  }>;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    challenge &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("forbidden", { status: 403 });
}

export async function POST(request: Request) {
  let payload: WhatsAppWebhookPayload;

  try {
    payload = (await request.json()) as WhatsAppWebhookPayload;
  } catch (error) {
    console.error("Invalid webhook payload", error);
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const entries = payload.entry ?? [];

  const processing = entries.flatMap((entry) => {
    if (!entry.changes?.length) {
      return [];
    }

    return entry.changes.map(async (change) => {
      if (change.field !== "messages" || !change.value?.messages?.length) {
        return;
      }

      const value = change.value;
      const messages = value.messages ?? [];

      if (!messages.length) {
        return;
      }

      await Promise.all(
        messages.map(async (message) => {
          const from =
            message.from ||
            value.contacts?.[0]?.wa_id ||
            value.metadata?.phone_number_id;

          if (!from) {
            return;
          }

          const prompt = extractPrompt(message);

          if (!prompt) {
            await sendTextMessage(
              from,
              "Send a text prompt to generate an image.",
            );
            return;
          }

          try {
            await sendTextMessage(
              from,
              `Creating your image for: "${prompt.slice(0, 300)}"`,
            );

            const image = await generateImageFromPrompt(prompt);
            const mediaId = await uploadImage(
              image,
              `render-${Date.now()}.png`,
            );

            await sendImageMessage(from, mediaId, `Prompt: ${prompt}`);
          } catch (error) {
            console.error("Failed to process message", error);

            await sendTextMessage(
              from,
              "Sorry, I couldn't create your image right now. Please try again.",
            );
          }
        }),
      );
    });
  });

  await Promise.allSettled(processing);

  return NextResponse.json({ status: "ok" });
}

function isTextMessage(message: WhatsAppMessage): message is TextMessage {
  return (
    message.type === "text" &&
    typeof (message as Partial<TextMessage>).text?.body === "string"
  );
}

function extractPrompt(message: WhatsAppMessage) {
  if (isTextMessage(message)) {
    const raw = message.text.body.trim();
    return raw?.length ? raw : null;
  }

  const buttonText =
    (message as Record<string, { text?: string }> | undefined)?.button?.text;

  const interactive = (
    message as {
      interactive?: {
        type?: string;
        button_reply?: { title?: string };
        list_reply?: { title?: string };
      };
    }
  ).interactive;

  const interactiveText =
    interactive?.type === "button"
      ? interactive.button_reply?.title
      : interactive?.type === "list_reply"
        ? interactive.list_reply?.title
        : undefined;

  const candidate = buttonText ?? interactiveText;

  const cleaned = candidate?.trim();
  return cleaned?.length ? cleaned : null;
}
