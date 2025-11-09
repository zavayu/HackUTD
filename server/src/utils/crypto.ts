import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is always 16
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The text to encrypt
 * @param key - The encryption key (should be 32 bytes for AES-256)
 * @returns Encrypted string in format: salt:iv:tag:encrypted
 */
export function encrypt(text: string, key?: string): string {
  if (!text) {
    throw new Error('Text to encrypt is required');
  }

  const encryptionKey = key || process.env['ENCRYPTION_KEY'];
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from the provided key and salt
  const derivedKey = crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, 'sha256');

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv) as crypto.CipherGCM;
  cipher.setAAD(Buffer.from('prodigypm-github-token'));

  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get the authentication tag
  const tag = cipher.getAuthTag();

  // Return salt:iv:tag:encrypted
  return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with the encrypt function
 * @param encryptedData - The encrypted string in format: salt:iv:tag:encrypted
 * @param key - The encryption key (should be 32 bytes for AES-256)
 * @returns Decrypted string
 */
export function decrypt(encryptedData: string, key?: string): string {
  if (!encryptedData) {
    throw new Error('Encrypted data is required');
  }

  const encryptionKey = key || process.env['ENCRYPTION_KEY'];
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  try {
    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }

    const salt = Buffer.from(parts[0]!, 'hex');
    const iv = Buffer.from(parts[1]!, 'hex');
    const tag = Buffer.from(parts[2]!, 'hex');
    const encrypted = parts[3]!;

    // Derive key from the provided key and salt
    const derivedKey = crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, 'sha256');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('prodigypm-github-token'));

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}