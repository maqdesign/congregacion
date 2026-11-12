// Cloudflare Pages Function for the existing read-only DEV membership diagnostic.
// Reuses the canonical handler; never grants access to private congregation content.
// The site itself must remain protected by Cloudflare Access before any deployment.
import { handleMembershipStatus } from "../../../app/api/dev/membership-status.mjs";

export async function onRequest({ request }) {
  const response = await handleMembershipStatus(request);
  // Pages _headers applies to static assets, not Function responses.
  const headers = new Headers(response.headers);
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-frame-options", "DENY");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.set("vary", "Authorization");
  if (response.status === 405) headers.set("allow", "GET");
  return new Response(response.body, { status: response.status, headers });
}
