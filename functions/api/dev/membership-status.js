// Cloudflare Pages Function for the existing read-only DEV membership diagnostic.
// Reuses the canonical handler; never grants access to private congregation content.
// The site itself must remain protected by Cloudflare Access before any deployment.
import { handleMembershipStatus } from "../../../app/api/dev/membership-status.mjs";

export async function onRequest({ request }) {
  return handleMembershipStatus(request);
}
