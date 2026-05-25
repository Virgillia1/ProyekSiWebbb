import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);

export const createPasswordHash = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derivedKey).toString('hex')}`;
};

export const verifyPasswordHash = async (password, passwordHash) => {
  if (!passwordHash) {
    return false;
  }

  const [algorithm, salt, storedHash] = String(passwordHash).split('$');

  if (algorithm !== 'scrypt' || !salt || !storedHash) {
    return false;
  }

  const derivedKey = await scryptAsync(password, salt, storedHash.length / 2);
  const storedBuffer = Buffer.from(storedHash, 'hex');
  const derivedBuffer = Buffer.from(derivedKey);

  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, derivedBuffer);
};
