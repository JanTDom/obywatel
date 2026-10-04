/**
 * Obywatel - Web Cryptography Module
 * Standard Web Crypto API (AES-GCM-256, PBKDF2-SHA256, SHA-256)
 * docs/PRIVACY.md: "Wybierz standardowe szyfrowanie uwierzytelnione. Nie buduj własnego algorytmu."
 */

export async function computeSha256(data: string | Uint8Array): Promise<string> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as unknown as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface EncryptedContainer {
  version: '1.0';
  algorithm: 'AES-GCM-256';
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  saltHex: string;
  ivHex: string;
  ciphertextHex: string;
  manifestSha256: string;
}

export async function deriveKey(passphrase: string, salt: Uint8Array, iterations = 100000): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptVault(plaintextJson: string, passphrase: string): Promise<EncryptedContainer> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const enc = new TextEncoder();
  const plaintextBytes = enc.encode(plaintextJson);
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBytes
  );

  const manifestSha256 = await computeSha256(plaintextBytes);

  return {
    version: '1.0',
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2-SHA-256',
    iterations: 100000,
    saltHex: Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join(''),
    ivHex: Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join(''),
    ciphertextHex: Array.from(new Uint8Array(ciphertextBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
    manifestSha256,
  };
}

export async function decryptVault(container: EncryptedContainer, passphrase: string): Promise<string> {
  if (container.algorithm !== 'AES-GCM-256' || container.kdf !== 'PBKDF2-SHA-256') {
    throw new Error('Nieobsługiwany format lub algorytm kontenera szyfrowanego.');
  }

  const salt = new Uint8Array(
    container.saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );
  const iv = new Uint8Array(
    container.ivHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );
  const ciphertext = new Uint8Array(
    container.ciphertextHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  const key = await deriveKey(passphrase, salt, container.iterations);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    const plaintext = new TextDecoder().decode(decryptedBuffer);
    const computedHash = await computeSha256(plaintext);
    if (computedHash !== container.manifestSha256) {
      throw new Error('Naruszenie integralności odszyfrowanego sejfu (niezgodność sumy kontrolnej SHA-256).');
    }
    return plaintext;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Naruszenie integralności')) {
      throw err;
    }
    throw new Error('Błąd odszyfrowania: nieprawidłowe hasło lub uszkodzony szyfrogram.');
  }
}
