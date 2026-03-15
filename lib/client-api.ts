export function withAuthorization(token: string | null | undefined, headers: HeadersInit = {}): HeadersInit {
  if (!token) {
    return { ...headers };
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

type ApiErrorResponse = {
  message?: string;
};

export async function parseApiErrorMessage(res: Response, fallbackMessage: string): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as ApiErrorResponse;
  return data?.message || fallbackMessage;
}
