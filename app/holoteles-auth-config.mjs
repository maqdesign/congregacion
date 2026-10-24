// Public configuration only. Never place passwords, service_role keys or private secrets here.
// Core must approve the exact Supabase Auth authority and allowed redirect origins before enabling.
export const HOLOTELES_AUTH_CONFIG=Object.freeze({
  enabled:false,
  provider:"holoteles-core",
  supabaseUrl:"",
  publishableKey:"",
  allowProduction:false
});
