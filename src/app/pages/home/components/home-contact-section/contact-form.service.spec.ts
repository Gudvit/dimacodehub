import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactMessage, WEB3FORMS_ENDPOINT, postToWeb3Forms } from "./contact-form.service";

const KEY = "test-access-key";

const MESSAGE: ContactMessage = {
  name: "Ada",
  email: "ada@example.com",
  message: "Let us talk about a new Angular project.",
  botcheck: false,
};

function stubFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("postToWeb3Forms", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the message to Web3Forms and resolves on success", async () => {
    const fetchMock = stubFetch(200, { success: true, message: "Email sent successfully!" });

    await expect(postToWeb3Forms(KEY, MESSAGE)).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(WEB3FORMS_ENDPOINT);
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body);
    expect(body.access_key).toBe(KEY);
    expect(body.name).toBe(MESSAGE.name);
    expect(body.email).toBe(MESSAGE.email);
    expect(body.message).toBe(MESSAGE.message);
    expect(body.subject).toContain(MESSAGE.name);
  });

  it("rejects when Web3Forms answers with success: false", async () => {
    stubFetch(200, { success: false, message: "Invalid access key" });

    await expect(postToWeb3Forms(KEY, MESSAGE)).rejects.toThrow("Invalid access key");
  });

  it("rejects on a transport error instead of pretending the message went out", async () => {
    stubFetch(500, {});

    await expect(postToWeb3Forms(KEY, MESSAGE)).rejects.toThrow(/500/);
  });

  it("lets an abort surface as an AbortError so the caller can tell it apart", async () => {
    const abort = new DOMException("The operation was aborted.", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abort));

    await expect(postToWeb3Forms(KEY, MESSAGE)).rejects.toBe(abort);
  });

  it("passes the caller's abort signal to fetch", async () => {
    const fetchMock = stubFetch(200, { success: true });
    const controller = new AbortController();

    await postToWeb3Forms(KEY, MESSAGE, controller.signal);

    expect(fetchMock.mock.calls[0]![1].signal).toBeInstanceOf(AbortSignal);
  });

  it("passes the honeypot value through so the service can drop bot submissions", async () => {
    const fetchMock = stubFetch(200, { success: true });

    await postToWeb3Forms(KEY, { ...MESSAGE, botcheck: true });

    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).botcheck).toBe(true);
  });
});
