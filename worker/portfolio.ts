export interface PortfolioEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

// The portfolio deliberately exposes no API. The former agent is retained only
// as source material for a future, separately deployed application.
export async function handlePortfolioRequest(request: Request, env: PortfolioEnv) {
  const { pathname } = new URL(request.url);
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return Response.json(
      { error: "Not found" },
      {
        status: 404,
        headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
      }
    );
  }
  return env.ASSETS.fetch(request);
}

const portfolio = { fetch: handlePortfolioRequest };
export default portfolio;
