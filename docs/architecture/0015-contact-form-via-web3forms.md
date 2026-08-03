# 0015. A working contact form through Web3Forms

## Status

Accepted. Supersedes [0010](0010-mailto-instead-of-contact-form.md) in part: the form is
back, `mailto` stays as the fallback.

## Context

ADR 0010 removed the contact form because it lied — it confirmed "message sent" while
sending nothing. Its closing condition was explicit: _if a form is ever needed, the real
receiver comes first and the UI second_.

`mailto` alone costs conversions. A visitor on webmail without a registered protocol
handler gets an empty click and copies the address by hand, if at all. For a portfolio
whose contact section is the whole point, that is the wrong trade.

The site is still static files on GitHub Pages (ADR 0003) and no backend is planned, so
the receiver had to be external and free:

| Option                | Free tier              | Why not / why yes                                           |
| --------------------- | ---------------------- | ----------------------------------------------------------- |
| Web3Forms             | 250 submissions/month  | chosen: public access key, no account in the request path   |
| Formspree             | 50 submissions/month   | tight cap, branding in the notification emails              |
| FormSubmit.co         | no hard cap, no signup | the receiving address ends up in the markup, less control   |
| Own Cloudflare Worker | generous free tier     | a second deploy target and mail-provider secrets: a backend |

## Decision

The contact section has a real form again. It posts directly to
`https://api.web3forms.com/submit`, and Web3Forms relays the message by email.

- `postToWeb3Forms()` in `contact-form.service.ts` is the transport: a plain `fetch`, a
  15 s `AbortSignal.timeout`, and a rejection unless the response is `ok` **and** the
  payload says `success: true`. `ContactFormService` binds the access key to it.
- The access key is a constant in the source. That is intended by the service: the key
  only permits posting to its owner's inbox, it reads nothing. It is not a secret, so it
  needs no build-time injection — and the receiving address stays out of the markup.
- No `HttpClient`: this is the app's only outbound request and the unit tests run under
  plain Vitest without the Angular compiler, so a DI-free `fetch` keeps both simple.
- The component holds `status: 'idle' | 'sending' | 'sent' | 'error'` as a signal and a
  `nonNullable` reactive form (name, email, message). The success screen appears **only**
  after the promise resolves; a rejection shows an error with the `mailto` address.
- Spam: a visually hidden `botcheck` honeypot control, which Web3Forms drops server-side.
- An `AbortController` tied to `DestroyRef.onDestroy()` cancels a request in flight.
- The "Write me an email" `mailto` link from ADR 0010 stays below the form, together with
  phone, Telegram and LinkedIn. If the service is down, the visitor still has a way out.

## Consequences

- The e2e test from ADR 0010 was replaced. Four specs now guard the section: the `mailto`
  fallback, validation refusing to send, a successful send asserted against the
  **intercepted request payload**, and a failing send that must not print "Message sent."
  The last one is the direct heir of the old "no fake form" test — the invariant did not
  change, only its shape: the UI may never claim delivery it did not get.
- `@angular/forms` stops being a dependency imported nowhere.
- Above 250 messages a month the form starts failing. At that volume the honest fix is a
  paid tier, not silent loss — the error state already points at the email address.
- A third party now sees the messages. Acceptable: the same content would travel through
  mail providers anyway, and nothing is stored in the app.
- Replacing the key (or the whole service) touches one constant and one function.
