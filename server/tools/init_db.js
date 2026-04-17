require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const readSql = (relativePath) =>
  fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8");

const run = async () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL belum di-set di server/.env");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const schemaSql = readSql("sql/schema.sql");
    const upgradeSql = readSql("sql/upgrade_auth.sql");

    await client.query("BEGIN");
    await client.query(schemaSql);
    await client.query(upgradeSql);
    await client.query("COMMIT");

    console.log("Database schema berhasil diinisialisasi.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Gagal inisialisasi database.", error.code || error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
