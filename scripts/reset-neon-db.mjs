import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { pool } from '../server/db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const execFileAsync = promisify(execFile);

const schemaPath = path.join(rootDir, 'database', 'neon-schema.sql');
const seedPath = path.join(rootDir, 'database', 'neon-seed.sql');

await execFileAsync(process.execPath, [path.join(rootDir, 'scripts', 'generate-neon-seed.mjs')], {
  cwd: rootDir,
});

const schemaSql = await fs.readFile(schemaPath, 'utf8');
const seedSql = await fs.readFile(seedPath, 'utf8');

await pool.query(schemaSql);
await pool.query(seedSql);

const summaryQuery = `
  SELECT
    (SELECT COUNT(*) FROM employees) AS employees_count,
    (SELECT COUNT(*) FROM packages) AS packages_count,
    (SELECT COUNT(*) FROM package_tracking_events) AS tracking_events_count,
    (SELECT COUNT(*) FROM attendance_records) AS attendance_count,
    (SELECT COUNT(*) FROM customers) AS customers_count,
    (SELECT COUNT(*) FROM user_accounts) AS user_accounts_count,
    (SELECT COUNT(*) FROM courier_accounts) AS courier_accounts_count,
    (SELECT COUNT(*) FROM customer_histories) AS histories_count,
    (SELECT COUNT(*) FROM vehicles) AS vehicles_count
`;

const { rows } = await pool.query(summaryQuery);
const [summary] = rows;

console.log(
  [
    `employees=${summary.employees_count}`,
    `packages=${summary.packages_count}`,
    `package_tracking_events=${summary.tracking_events_count}`,
    `attendance_records=${summary.attendance_count}`,
    `customers=${summary.customers_count}`,
    `user_accounts=${summary.user_accounts_count}`,
    `courier_accounts=${summary.courier_accounts_count}`,
    `customer_histories=${summary.histories_count}`,
    `vehicles=${summary.vehicles_count}`,
  ].join(', ')
);

await pool.end();
