type ApiErrorResponse = {
  message?: string;
};

export async function parseApiErrorMessage(res: Response, fallbackMessage: string): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as ApiErrorResponse;
  return data?.message || fallbackMessage;
}
