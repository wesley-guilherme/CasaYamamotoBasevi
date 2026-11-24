// Configuração do Drizzle Kit para gerar migrações a partir do esquema do banco.
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "sqlite",
});
