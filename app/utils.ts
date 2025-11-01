import sodium from 'libsodium-wrappers-sumo'

export function assert(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(message ?? 'value is falsy')
  }
}

// Chiffre une clé privée avec mot de passe
export async function encryptPrivateKey(privBase64: string, password: string) {
  await sodium.ready
  const priv = sodium.from_base64(privBase64)
  const salt = sodium.randombytes_buf(16)

  const key = sodium.crypto_pwhash(
    32,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  )

  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  const ciphertext = sodium.crypto_secretbox_easy(priv, nonce, key)

  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce),
    salt: sodium.to_base64(salt),
  }
}

// Déchiffre la clé privée
export async function decryptPrivateKey(encrypted: any, password: string) {
  await sodium.ready
  const salt = sodium.from_base64(encrypted.salt)
  const nonce = sodium.from_base64(encrypted.nonce)
  const ciphertext = sodium.from_base64(encrypted.ciphertext)

  const key = sodium.crypto_pwhash(
    32,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  )

  const priv = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key)
  return sodium.to_base64(priv)
}
