import "server-only";
import { serverSchemaForTests } from "./env";

/** Lê e valida segredos. Importar apenas em código de servidor (o pacote server-only impede o contrário). */
export function serverEnv() {
  return serverSchemaForTests.parse(process.env);
}
