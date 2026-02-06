import type { HouseSession } from "./types";

const USER_AGENT = "PolitiTrades/1.0 (contact@polititrades.com)";
const DISCLOSURE_URL = "https://disclosures-clerk.house.gov/FinancialDisclosure";

/**
 * Bootstrap a session with the House Financial Disclosure site.
 * Extracts anti-forgery cookie + __RequestVerificationToken from the HTML form.
 */
export async function bootstrapHouseSession(): Promise<HouseSession> {
  console.log("[session] Bootstrapping House disclosure session...");

  const response = await fetch(DISCLOSURE_URL, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to load disclosure page: ${response.status}`);
  }

  // Extract Set-Cookie headers
  const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
  const cookies = setCookieHeaders
    .map((c) => c.split(";")[0])
    .join("; ");

  // Extract __RequestVerificationToken from the HTML
  const html = await response.text();
  const tokenMatch = html.match(
    /name="__RequestVerificationToken"\s+(?:type="hidden"\s+)?value="([^"]+)"/
  );

  if (!tokenMatch) {
    // Try alternate ordering
    const altMatch = html.match(
      /value="([^"]+)"\s+name="__RequestVerificationToken"/
    );
    if (!altMatch) {
      throw new Error("Could not find __RequestVerificationToken in HTML");
    }
    return { cookies, token: altMatch[1] };
  }

  console.log("[session] Session bootstrapped successfully");
  return { cookies, token: tokenMatch[1] };
}
