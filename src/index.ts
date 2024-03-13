export interface Env {
  DOMAIN: string
  DKIM_PRIVATE_KEY: string
  API_KEY: string
}

interface EmailContent {
  type: string;
  value: string;
}

interface EmailName {
  email: string;
  name?: string;
}

interface personalization {
  bcc?: EmailName[];
  cc?: EmailName[];
  dkim_domain?: string;
  dkim_private_key?: string;
  dkim_selector?: string;
  from?: EmailName;
  headers?: {};
  reply_to?: EmailName;
  subject?: string;
  to: EmailName[];
}

interface EmailSendBody {
  content: EmailContent[];
  from: EmailName,
  headers?: {
    [key: string]: string;
  };
  mailfrom?: EmailName;
  personalizations: personalization[];
  reply_to?: EmailName;
  subject: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 })

    const apiKey = request.headers.get("Authorization")?.split(" ")[1]
    if (apiKey !== env.API_KEY) return new Response("Unauthorized", { status: 401 })

    const email: EmailSendBody = await request.json()
    email.personalizations = email.personalizations.map((personalization) => {
      return {
        ...personalization,
        dkim_domain: env.DOMAIN,
        dkim_private_key: env.DKIM_PRIVATE_KEY,
        dkim_selector: "mailchannels"
      }
    })

    return await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email)
    })
  }
}
