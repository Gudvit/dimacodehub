# 0010. Contact through mailto instead of a form

## Status

Superseded in part by [0015](0015-contact-form-via-web3forms.md): the form is back, now
with a real receiver (Web3Forms), and `mailto` became the fallback instead of the only
channel. The rule this ADR exists for still holds — the UI must never claim a message was
sent unless it was.

## Context

The contact section used to have a "Send a message" form. The site has no backend
(ADR 0003), so there was nowhere to send anything: submitting showed a "message sent"
confirmation and did nothing. The code even carried a `// TODO: send to API`.

That is worse than having no form at all: the visitor believed they had reached the
author, while the message never existed. On a page whose only job is to collect contact,
that is direct damage.

The options were: stand up a backend or a function, use an external form service
(Formspree and similar), or drop the form.

## Decision

There is no form. The contact section offers direct channels instead:

- A "Write me an email" button — a link with a `mailto:` URL assembled in
  `HomeContactSectionComponent`: the address plus a prefilled `subject` ("Project inquiry")
  and `body` ("Hi Dmytro,") through `encodeURIComponent`.
- Phone (`tel:`), email, location.
- Links to GitHub, X, LinkedIn and Telegram, all with `target="_blank"` and
  `rel="noopener noreferrer"`.
- A CV download button (relative link, `download`).

Bringing the form back is blocked at the test level: the e2e spec "contact section offers
a real mailto link, not a fake form" asserts both that the `mailto` link with the right
subject exists and that no `form.message-form` is present in the DOM.

## Consequences

- No message is ever lost: the email leaves from the visitor's own mail client and they
  keep a copy in their sent folder.
- Zero infrastructure: no backend, no keys, no spam protection, no GDPR questions about
  storing other people's messages.
- The price: `mailto` is awkward for webmail users without a protocol handler configured —
  some visitors will simply copy the address by hand. Conversion is lower than with a form.
- The email address is exposed in the markup and will be harvested by spam crawlers.
  Accepted deliberately: the same address is already in the CV.
- If a form is ever needed, the real receiver (a function or an external service) comes
  first and the UI second. Restoring the form without one is not allowed — the test will
  fail, and that is exactly the effect it was written for.
