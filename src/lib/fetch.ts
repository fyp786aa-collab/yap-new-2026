type FetchOptions = RequestInit & {
  timeout?: number;
};

interface FetchResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Generic fetch wrapper with error handling, timeouts, and JSON parsing
 */
export async function fetchHandler<T = unknown>(
  url: string,
  options?: FetchOptions,
): Promise<FetchResponse<T>> {
  const { timeout = 30000, ...fetchOptions } = options || {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = "Something went wrong";
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error || errorBody.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      return { data: null, error: errorMessage, status: response.status };
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = (await response.json()) as T;
      return { data, error: null, status: response.status };
    }

    return { data: null, error: null, status: response.status };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      return { data: null, error: "Request timed out", status: 0 };
    }
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error",
      status: 0,
    };
  }
}
