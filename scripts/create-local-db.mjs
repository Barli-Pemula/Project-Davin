import "dotenv/config";
import pg from "pg";
const connection = new URL(process.env.DATABASE_URL);
const name = connection.pathname.slice(1);
if (!/^[a-zA-Z0-9_]+$/.test(name))
  throw new Error("Nama database tidak valid.");
connection.pathname = "/postgres";
connection.search = "";
const client = new pg.Client({ connectionString: connection.toString() });
await client.connect();
const found = await client.query(
  "SELECT 1 FROM pg_database WHERE datname = $1",
  [name],
);
if (!found.rowCount) await client.query(`CREATE DATABASE "${name}"`);
await client.end();
console.log("Database lokal siap.");
