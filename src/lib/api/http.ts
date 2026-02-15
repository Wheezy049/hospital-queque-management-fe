import { getToken, clearToken } from "@/lib/auth/token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  console.warn("NEXT_PUBLIC_API_URL is not set");
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions<TBody> = {
  method?: HttpMethod;
  body?: TBody;
  auth?: boolean;
};

export async function http<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  // Handle expired/invalid token globally
  if (res.status === 401) {
    clearToken();
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as TResponse;
}
