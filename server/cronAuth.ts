// Lives outside `api/` on purpose: any file under `api/` is deployed by Vercel
// as its own function, so shared helpers must sit in a sibling folder instead.

export type HandlerRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

export type HandlerResponse = {
  status: (statusCode: number) => HandlerResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export function getBearerToken(value: string | string[] | undefined) {
  const authorization = Array.isArray(value) ? value[0] : value;
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export function isAuthorizedCronRequest(req: HandlerRequest): boolean {
  const cronSecret = process.env.SCRAPER_CRON_SECRET ?? process.env.CRON_SECRET;
  return !cronSecret || getBearerToken(req.headers.authorization) === cronSecret;
}

export function getSupabaseAdminConfig(): { supabaseUrl: string; serviceRoleKey: string } | null {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return { supabaseUrl, serviceRoleKey };
}
