// Declaração dos recursos e variáveis de ambiente disponíveis no Worker Cloudflare.
// Quantidade de registros alterados por uma operação no banco D1.
interface D1ResultMeta {
  changes: number;
}

// Metadados retornados pela execução de uma instrução no D1.
interface D1RunResult {
  meta: D1ResultMeta;
}

// Conjunto de registros retornado por uma consulta ao D1.
interface D1AllResult<T> {
  results: T[];
}

// Contrato das consultas parametrizadas e das operações de leitura e escrita no D1.
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1AllResult<T>>;
  run(): Promise<D1RunResult>;
}

// Conexão D1 utilizada para preparar instruções SQL.
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

// Contrato de acesso HTTP aos arquivos e recursos servidos pelo ambiente Cloudflare.
interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

// Conteúdo e metadados de um arquivo recuperado do armazenamento R2.
interface R2ObjectBody {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  writeHttpMetadata(headers: Headers): void;
}

// Contrato das operações de consulta, gravação e exclusão de arquivos no R2.
interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType: string } }): Promise<unknown>;
  delete(key: string): Promise<void>;
}

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    AUTH_SITE_URL?: string;
    AUTH_EMAIL_ENABLED?: string;
    AUTH_PRIMARY_HOST_ID?: string;
    // Autoriza cabeçalhos da plataforma somente em hospedagem que comprove sua autenticidade.
    AUTH_PLATFORM_HEADERS_ENABLED?: string;
  };
}
