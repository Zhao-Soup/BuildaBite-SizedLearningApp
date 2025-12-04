const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(headers || {})
  };
  if (token) {
    (finalHeaders as any).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    cache: "no-store"
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = (await res.json()) as any;
      detail = data?.detail || JSON.stringify(data);
    } catch {
      // ignore
    }
    throw new Error(detail || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}



