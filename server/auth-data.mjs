import crypto from 'node:crypto';
import { pool, withTransaction } from './db.mjs';
import { BadRequestError, ConflictError } from './errors.mjs';
import { createPasswordHash, verifyPasswordHash } from './password-hash.mjs';

export const ADMIN_USERNAME_PREFIX = 'admin_';
export const ADMIN_VERIFICATION_CODE = 'ADMCARGOLITE';

let authInfrastructurePromise;

const normalizeUsername = (value) => String(value ?? '').trim().toLowerCase();

const normalizeText = (value) => String(value ?? '').trim();

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

const validateRequired = (value, message) => {
  if (!normalizeText(value)) {
    throw new BadRequestError(message);
  }
};

const validateUsername = (username) => {
  if (!username) {
    throw new BadRequestError('Username wajib diisi.');
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    throw new BadRequestError('Username hanya boleh berisi huruf, angka, dan underscore.');
  }
};

const validatePassword = (password) => {
  if (!password || String(password).length < 6) {
    throw new BadRequestError('Password minimal 6 karakter.');
  }
};

const ensureAdminRequirements = (username, verificationCode) => {
  if (!username.startsWith(ADMIN_USERNAME_PREFIX)) {
    throw new BadRequestError('Username admin harus diawali dengan admin_.');
  }

  if (normalizeText(verificationCode) !== ADMIN_VERIFICATION_CODE) {
    throw new BadRequestError('Kode verifikasi admin tidak valid.');
  }
};

const mapAuthUserRow = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  phone: row.phone ?? undefined,
  avatar: row.avatar_url ?? undefined,
  employeeId: row.employee_id ?? undefined,
});

const getNextCustomerId = async (client) => {
  const { rows } = await client.query(
    `
      SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) AS max_sequence
      FROM customers
      WHERE id ~ '^CUS-[0-9]+$'
    `
  );

  const nextSequence = Number(rows[0]?.max_sequence ?? 0) + 1;
  return `CUS-${String(nextSequence).padStart(3, '0')}`;
};

const getAccountByUsername = async (client, username) => {
  const { rows } = await client.query(
    `
      SELECT
        ua.id,
        ua.username,
        ua.password_hash,
        ua.role,
        COALESCE(c.name, ua.name) AS name,
        COALESCE(c.email, ua.email) AS email,
        COALESCE(c.phone, ua.phone) AS phone,
        ua.avatar_url,
        NULL AS employee_id
      FROM user_accounts ua
      LEFT JOIN customers c ON c.id = ua.customer_id
      WHERE ua.username = $1
      LIMIT 1
    `,
    [username]
  );

  if (rows[0]) {
    return rows[0];
  }

  const { rows: courierRows } = await client.query(
    `
      SELECT
        ca.id,
        ca.username,
        ca.password_hash,
        ca.role,
        COALESCE(e.name, ca.name) AS name,
        ca.email AS email,
        COALESCE(e.phone, ca.phone) AS phone,
        ca.avatar_url,
        ca.employee_id
      FROM courier_accounts ca
      LEFT JOIN employees e ON e.id = ca.employee_id
      WHERE ca.username = $1
      LIMIT 1
    `,
    [username]
  );

  return courierRows[0] ?? null;
};

const ensureUsernameAvailable = async (client, username) => {
  const { rowCount } = await client.query(
    'SELECT 1 FROM user_accounts WHERE username = $1 LIMIT 1',
    [username]
  );

  if (rowCount) {
    throw new ConflictError('Username sudah digunakan oleh akun lain.');
  }
};

const ensureCustomerEmailAvailable = async (client, email) => {
  const { rowCount } = await client.query(
    'SELECT 1 FROM customers WHERE LOWER(email) = $1 LIMIT 1',
    [email]
  );

  if (rowCount) {
    throw new ConflictError('Email customer sudah terdaftar di database.');
  }
};

const buildAccountId = () => `USR-${crypto.randomUUID()}`;

const createUserAccount = async (client, account) => {
  const passwordHash = await createPasswordHash(account.password);

  await client.query(
    `
      INSERT INTO user_accounts (
        id, username, password_hash, role, name, email, phone, address, avatar_url, customer_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
    `,
    [
      buildAccountId(),
      account.username,
      passwordHash,
      account.role,
      account.name,
      account.email,
      account.phone ?? null,
      account.address ?? null,
      account.avatarUrl ?? null,
      account.customerId ?? null,
    ]
  );
};

const createAuthInfrastructure = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_accounts (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NULL,
      address TEXT NULL,
      avatar_url TEXT NULL,
      customer_id TEXT NULL UNIQUE REFERENCES customers(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON user_accounts(role)');
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_user_accounts_customer_id ON user_accounts(customer_id)'
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS courier_accounts (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'courier' CHECK (role = 'courier'),
      employee_id TEXT NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NULL,
      avatar_url TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_courier_accounts_role ON courier_accounts(role)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_courier_accounts_employee_id ON courier_accounts(employee_id)');
};

export const ensureAuthInfrastructure = async () => {
  authInfrastructurePromise ??= createAuthInfrastructure().catch((error) => {
    authInfrastructurePromise = undefined;
    throw error;
  });

  return authInfrastructurePromise;
};

export const loginWithAccount = async (username, password) => {
  await ensureAuthInfrastructure();

  const normalizedUsername = normalizeUsername(username);
  const normalizedPassword = String(password ?? '');

  validateRequired(normalizedUsername, 'Username wajib diisi.');
  validateRequired(normalizedPassword, 'Password wajib diisi.');

  const account = await getAccountByUsername(pool, normalizedUsername);

  if (!account) {
    throw new BadRequestError('Username atau Password yang anda masukan salah!');
  }

  const passwordMatches = await verifyPasswordHash(normalizedPassword, account.password_hash);

  if (!passwordMatches) {
    throw new BadRequestError('Username atau Password yang anda masukan salah!');
  }

  return mapAuthUserRow(account);
};

export const registerCustomerAccount = async (payload) => {
  await ensureAuthInfrastructure();

  return withTransaction(async (client) => {
    const username = normalizeUsername(payload.username);
    const name = normalizeText(payload.name);
    const email = normalizeEmail(payload.email);
    const phone = normalizeText(payload.phone);
    const address = normalizeText(payload.address);
    const password = String(payload.password ?? '');

    validateRequired(name, 'Nama customer wajib diisi.');
    validateRequired(email, 'Email customer wajib diisi.');
    validateRequired(phone, 'Nomor telepon customer wajib diisi.');
    validateRequired(address, 'Alamat customer wajib diisi.');
    validateUsername(username);
    validatePassword(password);

    await ensureUsernameAvailable(client, username);
    await ensureCustomerEmailAvailable(client, email);

    const customerId = await getNextCustomerId(client);

    await client.query(
      `
        INSERT INTO customers (
          id, name, address, email, phone, total_sent, total_received, last_activity
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, CURRENT_DATE
        )
      `,
      [customerId, name, address, email, phone, 0, 0]
    );

    await createUserAccount(client, {
      username,
      password,
      role: 'customer',
      name,
      email,
      phone,
      address,
      customerId,
    });

    const createdAccount = await getAccountByUsername(client, username);
    return mapAuthUserRow(createdAccount);
  });
};

export const registerAdminAccount = async (payload) => {
  await ensureAuthInfrastructure();

  return withTransaction(async (client) => {
    const username = normalizeUsername(payload.username);
    const name = normalizeText(payload.name);
    const email = normalizeEmail(payload.email);
    const phone = normalizeText(payload.phone);
    const password = String(payload.password ?? '');
    const verificationCode = normalizeText(payload.verificationCode);

    validateRequired(name, 'Nama admin wajib diisi.');
    validateRequired(email, 'Email admin wajib diisi.');
    validateRequired(phone, 'Nomor telepon admin wajib diisi.');
    validateUsername(username);
    validatePassword(password);
    ensureAdminRequirements(username, verificationCode);

    await ensureUsernameAvailable(client, username);

    await createUserAccount(client, {
      username,
      password,
      role: 'admin',
      name,
      email,
      phone,
      address: null,
      customerId: null,
    });

    const createdAccount = await getAccountByUsername(client, username);
    return mapAuthUserRow(createdAccount);
  });
};
