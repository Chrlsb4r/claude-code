import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";

// Banco descartável para testes. Requer um Postgres local (ver docs/DESENVOLVIMENTO.md).
export const ADMIN_URL = process.env.TEST_DATABASE_ADMIN_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/postgres";
export const TEST_DB = "convites_test";

export default async function setup() {
  const admin = new Client({ connectionString: ADMIN_URL });
  try {
    await admin.connect();
  } catch {
    console.warn("[db] Postgres local indisponível: testes de banco serão ignorados.");
    process.env.SKIP_DB_TESTS = "1";
    return;
  }
  await admin.query(`drop database if exists ${TEST_DB} with (force)`);
  await admin.query(`create database ${TEST_DB}`);
  await admin.end();

  const db = new Client({ connectionString: ADMIN_URL.replace(/\/[^/]+$/, `/${TEST_DB}`) });
  await db.connect();
  const root = path.resolve(__dirname, "../../supabase");
  await db.query("set client_min_messages = error");
  await db.query(fs.readFileSync(path.join(root, "local/00_supabase_shim.sql"), "utf8"));
  for (const f of fs.readdirSync(path.join(root, "migrations")).sort()) {
    await db.query(fs.readFileSync(path.join(root, "migrations", f), "utf8"));
  }
  await db.query(fs.readFileSync(path.join(root, "seed.sql"), "utf8"));
  await db.end();
}
