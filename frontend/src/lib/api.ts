export const apiUrl = "";

type CsrfToken = {
  headerName: string;
  token: string;
};

export async function csrfFetch(path: string, init: RequestInit = {}) {
  const csrfResponse = await fetch(`${apiUrl}/api/auth/csrf`, {
    credentials: "include",
  });

  if (!csrfResponse.ok) {
    throw new Error("CSRF token request failed");
  }

  const csrfToken = (await csrfResponse.json()) as CsrfToken;
  const headers = new Headers(init.headers);
  headers.set(csrfToken.headerName, csrfToken.token);

  return fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
}
