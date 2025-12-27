export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16 text-zinc-900 dark:text-zinc-100">
      <header className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
          WhatsApp Image Agent
        </span>
        <h1 className="text-4xl font-semibold tracking-tight">
          Automatically convert WhatsApp prompts into high-quality images.
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
          Deploy this app to Vercel, connect it to the WhatsApp Cloud API, and
          every inbound message becomes an AI-generated image reply powered by
          OpenAI.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-semibold">Configuration</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Add the following environment variables before deploying:
        </p>
        <ul className="grid gap-3 text-sm">
          <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800">
            OPENAI_API_KEY
          </li>
          <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800">
            WHATSAPP_TOKEN
          </li>
          <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800">
            WHATSAPP_PHONE_NUMBER_ID
          </li>
          <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800">
            WHATSAPP_VERIFY_TOKEN
          </li>
        </ul>
      </section>

      <section className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
          <li>
            1. WhatsApp sends an inbound message to{" "}
            <code>/api/webhook</code>.
          </li>
          <li>
            2. The server validates the request using{" "}
            <code>WHATSAPP_VERIFY_TOKEN</code>.
          </li>
          <li>3. The text prompt is forwarded to OpenAI image generation.</li>
          <li>
            4. The rendered image is uploaded to the WhatsApp Graph API and
            returned to the user with the original prompt as caption.
          </li>
        </ol>
      </section>

      <section className="space-y-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Webhook Setup Checklist
        </h2>
        <ul className="space-y-2">
          <li>• Configure the webhook URL to point at `/api/webhook`.</li>
          <li>• Enable the <em>messages</em> subscription.</li>
          <li>• Confirm the verification challenge using your verify token.</li>
          <li>• Send a WhatsApp message to test automated image replies.</li>
        </ul>
      </section>
    </main>
  );
}
