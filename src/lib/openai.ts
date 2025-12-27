import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

export async function generateImageFromPrompt(prompt: string) {
  const openai = getClient();

  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    quality: "high",
    response_format: "b64_json",
  });

  const image = response.data?.[0]?.b64_json;

  if (!image) {
    throw new Error("Image generation returned no data");
  }

  return Buffer.from(image, "base64");
}
