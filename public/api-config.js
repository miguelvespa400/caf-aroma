export function resolveApiUrl(pathname) {
  if (typeof window === "undefined") {
    return new URL(pathname, "http://localhost:3000").toString();
  }

  const { protocol, hostname, port } = window.location;
  const servidorDaAplicacao = hostname === "localhost" || hostname === "127.0.0.1";
  const usaOrigemDoServidor = servidorDaAplicacao && (port === "" || port === "3000");
  const baseUrl = usaOrigemDoServidor ? `${protocol}//${hostname}${port ? `:${port}` : ""}` : "http://localhost:3000";

  return new URL(pathname, baseUrl).toString();
}
