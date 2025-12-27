## WhatsApp Image Agent

This project turns every inbound WhatsApp message into an AI-generated image reply using OpenAI's image endpoint and the WhatsApp Cloud API.

### Prerequisites

- Meta WhatsApp Cloud API app with a Business or test phone number
- OpenAI API key with access to image generation

### Environment variables

Create a `.env.local` file with:

```bash
OPENAI_API_KEY=sk-...
WHATSAPP_TOKEN=EAAD...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_VERIFY_TOKEN=your-verify-token
```

### Local development

```bash
npm install
npm run dev
```

Expose the local server (e.g. using `ngrok`) and set the webhook URL in Meta's dashboard to `https://<your-ngrok-domain>/api/webhook`. Subscribe to the **messages** field and confirm the challenge using the verify token.

### Production deployment

1. Set the same environment variables on Vercel.
2. Deploy the project.
3. Register the deployed webhook URL in Meta's dashboard.
4. Send a text prompt to your WhatsApp number and receive the generated image.

### How it works

1. WhatsApp delivers the user prompt to `/api/webhook`.
2. The server validates the request with `WHATSAPP_VERIFY_TOKEN`.
3. OpenAI generates a 1024×1024 PNG image for the prompt.
4. The image is uploaded to the Graph API and returned to the sender with the original prompt as a caption.
