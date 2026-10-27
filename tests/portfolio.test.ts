import { afterEach, describe, expect, it, vi } from "vitest";
import { handlePortfolioRequest, type PortfolioEnv } from "../worker/portfolio";

describe("portfolio-only Worker", () => {
  const origin = "https://portfolio.example";

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(["GET", "POST", "HEAD", "OPTIONS", "PUT", "PATCH", "DELETE"])(
    "rejects retired API routes for %s without reaching assets or a provider",
    async (method) => {
      const network = vi.fn();
      vi.stubGlobal("fetch", network);
      const assets = vi.fn();
      // No database binding, provider key, or visitor-verification setup is needed.
      const env: PortfolioEnv = { ASSETS: { fetch: assets } };

      for (const path of [
        "/api",
        "/api/",
        "/api/search?q=authorization",
        "/api/explore",
        "/api/status",
        "/api/unknown",
      ]) {
        const response = await handlePortfolioRequest(
          new Request(`${origin}${path}`, {
            method,
            headers: { Authorization: "Bearer obsolete-evaluation-token" },
            ...(method === "POST" ? { body: "not even valid JSON" } : {}),
          }),
          env
        );

        expect(response.status).toBe(404);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(await response.json()).toEqual({ error: "Not found" });
      }

      expect(assets).not.toHaveBeenCalled();
      expect(network).not.toHaveBeenCalled();
    }
  );

  it.each(["/experience", "/notes/optimistic-concurrency", "/apiary"])(
    "passes the original asset request and response through for %s",
    async (path) => {
      const network = vi.fn();
      vi.stubGlobal("fetch", network);
      const request = new Request(`${origin}${path}?theme=light`, {
        headers: { "If-None-Match": '"page-v1"' },
      });
      const assetResponse = new Response("rendered page", {
        status: 200,
        headers: { "Content-Type": "text/html", ETag: '"page-v2"' },
      });
      const assets = vi.fn().mockResolvedValue(assetResponse);

      const response = await handlePortfolioRequest(request, {
        ASSETS: { fetch: assets },
      });

      expect(assets).toHaveBeenCalledTimes(1);
      expect(assets).toHaveBeenCalledWith(request);
      expect(response).toBe(assetResponse);
      expect(response.headers.get("ETag")).toBe('"page-v2"');
      expect(await response.text()).toBe("rendered page");
      expect(network).not.toHaveBeenCalled();
    }
  );

  it("preserves the asset service's missing-page response", async () => {
    const assetResponse = new Response("Not found page", { status: 404 });
    const assets = vi.fn().mockResolvedValue(assetResponse);

    const response = await handlePortfolioRequest(new Request(`${origin}/lab`), {
      ASSETS: { fetch: assets },
    });

    expect(response).toBe(assetResponse);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not found page");
  });
});
