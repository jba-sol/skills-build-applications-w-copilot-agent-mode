// Relative /api paths go through the Vite dev proxy, so port 8000 never needs to be public.
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function getJson<T>(path: string): Promise<T> {
  const url = path.startsWith('http') ? path : `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url);
  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const body = await response.json() as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // Keep the status-based message when the response has no JSON body.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}
