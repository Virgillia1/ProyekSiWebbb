import crypto from 'node:crypto';
import { pool, withTransaction } from './db.mjs';
import { BadRequestError, ConflictError } from './errors.mjs';
import { createPasswordHash, verifyPasswordHash } from './password-hash.mjs';

export const ADMIN_USERNAME_PREFIX = 'admin_';
export const ADMIN_VERIFICATION_CODE = 'ADMCARGOLITE';
const MIN_PHONE_DIGITS = 12;

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

const getPhoneDigitCount = (value) => normalizeText(value).replace(/\D/g, '').length;

const validatePhone = (value, requiredMessage, label = 'Nomor telepon') => {
  validateRequired(value, requiredMessage);
  const norm = normalizeText(value);
  if (/\D/.test(norm)) {
    throw new BadRequestError(`${label} hanya boleh berisi angka.`);
  }
  if (norm.length < MIN_PHONE_DIGITS) {
    throw new BadRequestError(`${label} minimal ${MIN_PHONE_DIGITS} digit.`);
  }
};

const validateOptionalPhone = (value, label = 'Nomor telepon') => {
  const norm = normalizeText(value);
  if (norm) {
    if (/\D/.test(norm)) {
      throw new BadRequestError(`${label} hanya boleh berisi angka.`);
    }
    if (norm.length < MIN_PHONE_DIGITS) {
      throw new BadRequestError(`${label} minimal ${MIN_PHONE_DIGITS} digit.`);
    }
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
  username: row.username,
  name: row.name,
  email: row.email,
  role: row.role,
  phone: row.phone ?? undefined,
  avatar: row.avatar_url ?? undefined,
  employeeId: row.employee_id ?? row.courier_id ?? undefined,
  courierId: row.courier_id ?? row.employee_id ?? undefined,
  address: row.address ?? undefined,
  customerId: row.customer_id ?? undefined,
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
        COALESCE(c.address, ua.address) AS address,
        ua.customer_id,
        ua.avatar_url,
        NULL AS courier_id,
        NULL AS employee_id
      FROM user_accounts ua
      LEFT JOIN customers c ON c.id = ua.customer_id
      WHERE ua.username = $1
      UNION ALL
      SELECT
        ca.id,
        ca.username,
        ca.password_hash,
        ca.role,
        ca.name,
        ca.email,
        ca.phone,
        NULL AS address,
        NULL AS customer_id,
        ca.avatar_url,
        ca.courier_id,
        ca.courier_id AS employee_id
      FROM courier_accounts ca
      WHERE ca.username = $1
      LIMIT 1
    `,
    [username]
  );

  return rows[0] ?? null;
};

export const getAuthUserByCustomerId = async (customerId) => {
  await ensureAuthInfrastructure();
  const { rows } = await pool.query(
    'SELECT username FROM user_accounts WHERE customer_id = $1 LIMIT 1',
    [customerId]
  );
  const username = rows[0]?.username;
  if (!username) return null;
  const account = await getAccountByUsername(pool, username);
  return mapAuthUserRow(account);
};


const ensureUsernameAvailable = async (client, username) => {
  const { rowCount } = await client.query(
    'SELECT 1 FROM user_accounts WHERE username = $1 LIMIT 1',
    [username]
  );

  if (rowCount) {
    throw new ConflictError('Username sudah digunakan oleh akun lain.');
  }

  const { rowCount: courierAccountCount } = await client.query(
    'SELECT 1 FROM courier_accounts WHERE username = $1 LIMIT 1',
    [username]
  );

  if (courierAccountCount) {
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON user_accounts(role)');
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_user_accounts_customer_id ON user_accounts(customer_id)'
  );
  await pool.query(
    'ALTER TABLE packages ADD COLUMN IF NOT EXISTS sender_username TEXT NULL'
  );
  await pool.query(
    'ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS feedback TEXT NULL'
  );
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

  // Cari di user_accounts dulu (admin & customer)
  const account = await getAccountByUsername(pool, normalizedUsername);

  if (account) {
    const passwordMatches = await verifyPasswordHash(normalizedPassword, account.password_hash);
    if (!passwordMatches) {
      throw new BadRequestError('Username atau Password yang anda masukan salah!');
    }
    return mapAuthUserRow(account);
  }

  // Jika tidak ditemukan, cari di courier_accounts
  const { rows: courierRows } = await pool.query(
    `
      SELECT id, username, password_hash, role, employee_id, name, email, phone, avatar_url
      FROM courier_accounts
      WHERE username = $1
      LIMIT 1
    `,
    [normalizedUsername]
  );
  const courierAccount = courierRows[0] ?? null;

  if (!courierAccount) {
    throw new BadRequestError('Username atau Password yang anda masukan salah!');
  }

  const courierPasswordMatches = await verifyPasswordHash(normalizedPassword, courierAccount.password_hash);
  if (!courierPasswordMatches) {
    throw new BadRequestError('Username atau Password yang anda masukan salah!');
  }

  return {
    id: courierAccount.id,
    name: courierAccount.name,
    email: courierAccount.email,
    role: 'courier',
    phone: courierAccount.phone ?? undefined,
    avatar: courierAccount.avatar_url ?? undefined,
    employeeId: courierAccount.employee_id,
  };
};

export const resetAccountPassword = async (payload) => {
  await ensureAuthInfrastructure();

  const username = normalizeUsername(payload?.username);
  const password = String(payload?.password ?? '');

  validateUsername(username);
  validatePassword(password);

  const passwordHash = await createPasswordHash(password);

  const { rowCount } = await pool.query(
    'UPDATE user_accounts SET password_hash = $1 WHERE username = $2',
    [passwordHash, username]
  );

  if (rowCount) {
    return { ok: true };
  }

  const { rowCount: courierRowCount } = await pool.query(
    'UPDATE courier_accounts SET password_hash = $1 WHERE username = $2',
    [passwordHash, username]
  );

  if (courierRowCount) {
    return { ok: true };
  }

  throw new BadRequestError('Username tidak di temukan');
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
    validatePhone(phone, 'Nomor telepon customer wajib diisi.', 'Nomor telepon customer');
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
    validatePhone(phone, 'Nomor telepon admin wajib diisi.', 'Nomor telepon admin');
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

export const registerCourierAccount = async (payload) => {
  await ensureAuthInfrastructure();

  return withTransaction(async (client) => {
    const courierId = normalizeText(payload.courierId ?? payload.employeeId);
    const username = normalizeUsername(payload.username);
    const email = normalizeEmail(payload.email);
    const phone = normalizeText(payload.phone);
    const password = String(payload.password ?? '');

    validateRequired(courierId, 'ID kurir wajib diisi.');
    validateRequired(email, 'Email kurir wajib diisi.');
    validateOptionalPhone(phone, 'Nomor telepon kurir');
    validateUsername(username);
    validatePassword(password);

    const { rows: courierRows } = await client.query(
      'SELECT id, name, phone FROM couriers WHERE id = $1 LIMIT 1',
      [courierId]
    );
    if (!courierRows[0]) {
      throw new BadRequestError('Data kurir tidak ditemukan.');
    }
    const courier = courierRows[0];

    const { rowCount: existingCourierCount } = await client.query(
      'SELECT 1 FROM courier_accounts WHERE courier_id = $1 LIMIT 1',
      [courierId]
    );
    if (existingCourierCount) {
      throw new ConflictError('Kurir ini sudah memiliki akun login.');
    }

    // Cek username tidak bentrok di user_accounts maupun courier_accounts
    const { rowCount: userCount } = await client.query(
      'SELECT 1 FROM user_accounts WHERE username = $1 LIMIT 1',
      [username]
    );
    if (userCount) {
      throw new ConflictError('Username sudah digunakan oleh akun lain.');
    }
    const { rowCount: courierCount } = await client.query(
      'SELECT 1 FROM courier_accounts WHERE username = $1 LIMIT 1',
      [username]
    );
    if (courierCount) {
      throw new ConflictError('Username sudah digunakan oleh akun kurir lain.');
    }

    const passwordHash = await createPasswordHash(password);
    const accountId = `CUR-${crypto.randomUUID()}`;

    await client.query(
      `
        INSERT INTO courier_accounts (
          id, username, password_hash, role, courier_id, name, email, phone, avatar_url
        ) VALUES (
          $1, $2, $3, 'courier', $4, $5, $6, $7, NULL
        )
      `,
      [
        accountId,
        username,
        passwordHash,
        courierId,
        courier.name,
        email,
        phone || courier.phone || null,
      ]
    );

    return {
      id: accountId,
      name: courier.name,
      email,
      role: 'courier',
      phone: phone || courier.phone || undefined,
      courierId,
      employeeId: courierId,
    };
  });
};
