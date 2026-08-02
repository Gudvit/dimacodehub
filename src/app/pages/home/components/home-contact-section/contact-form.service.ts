import { Injectable } from "@angular/core";

/**
 * Web3Forms access key. It is meant to live in the client bundle: the key only allows
 * posting a message to the inbox it was created for, it never reads anything back.
 * Issued for free at https://web3forms.com (250 submissions per month).
 *
 * If the key is ever wrong or revoked, every send fails and the form says so - it never
 * claims a message was delivered. See docs/architecture/0015-contact-form-via-web3forms.md.
 */
const ACCESS_KEY = "9998e810-4fa8-4382-9178-fdef15e1d5cb";

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const TIMEOUT_MS = 15_000;

export interface ContactMessage {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  /** Honeypot: real people never see this field, bots fill it in. */
  readonly botcheck: boolean;
}

interface Web3FormsResponse {
  readonly success?: boolean;
  readonly message?: string;
}

/**
 * Posts a message to Web3Forms, which relays it by email. Rejects unless the service
 * confirms the send - a rejected promise is what makes the UI tell the truth.
 */
export async function postToWeb3Forms(
  accessKey: string,
  message: ContactMessage,
  signal?: AbortSignal,
): Promise<void> {
  const deadline = AbortSignal.timeout(TIMEOUT_MS);

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
    body: JSON.stringify({
      access_key: accessKey,
      subject: `Portfolio message from ${message.name}`,
      from_name: "dimacodehub",
      name: message.name,
      email: message.email,
      message: message.message,
      botcheck: message.botcheck,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Web3FormsResponse;

  if (!response.ok || payload.success !== true) {
    throw new Error(payload.message ?? `Web3Forms responded with ${response.status}.`);
  }
}

/**
 * The site has no backend (see docs/architecture/0015-contact-form-via-web3forms.md).
 * This is the only outbound request the app makes, so it uses `fetch` directly rather
 * than pulling `HttpClient` into the bundle.
 */
@Injectable({ providedIn: "root" })
export class ContactFormService {
  send(message: ContactMessage, signal?: AbortSignal): Promise<void> {
    return postToWeb3Forms(ACCESS_KEY, message, signal);
  }
}
