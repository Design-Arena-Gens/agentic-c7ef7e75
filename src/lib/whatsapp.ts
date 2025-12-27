const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

function getConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token) {
    throw new Error("WHATSAPP_TOKEN is not set");
  }

  if (!phoneNumberId) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID is not set");
  }

  return { token, phoneNumberId };
}

async function callGraph<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${GRAPH_API_BASE}/${path}`, init);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Graph API request failed (${response.status}): ${errorBody}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function sendTextMessage(to: string, body: string) {
  const { token, phoneNumberId } = getConfig();

  await callGraph(`${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
  });
}

export async function uploadImage(image: Buffer, filename: string) {
  const { token, phoneNumberId } = getConfig();
  const form = new FormData();

  form.append("messaging_product", "whatsapp");
  const imageBytes = Uint8Array.from(image);
  form.append(
    "file",
    new Blob([imageBytes], {
      type: "image/png",
    }),
    filename,
  );

  const result = await callGraph<{ id: string }>(`${phoneNumberId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  return result.id;
}

export async function sendImageMessage(
  to: string,
  mediaId: string,
  caption?: string,
) {
  const { token, phoneNumberId } = getConfig();

  await callGraph(`${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "image",
      image: {
        id: mediaId,
        caption,
      },
    }),
  });
}
