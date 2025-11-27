// src/crypto.js
import sodium from 'libsodium-wrappers-sumo'

export async function generateKeys() {
  await sodium.ready
  const kp = sodium.crypto_box_keypair()
  return {
    pub: sodium.to_base64(kp.publicKey, sodium.base64_variants.URLSAFE_NO_PADDING),
    priv: sodium.to_base64(kp.privateKey, sodium.base64_variants.URLSAFE_NO_PADDING),
  }
}

export async function generateGroupKey() {
  await sodium.ready
  const kp = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES)
  return sodium.to_base64(kp, sodium.base64_variants.URLSAFE_NO_PADDING)
}

// Chiffre une clé privée avec mot de passe
export async function encryptPrivateKey(privBase64: string, password: string) {
  await sodium.ready
  const priv = sodium.from_base64(privBase64, sodium.base64_variants.URLSAFE_NO_PADDING)
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
    ciphertext: sodium.to_base64(ciphertext, sodium.base64_variants.URLSAFE_NO_PADDING),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.URLSAFE_NO_PADDING),
    salt: sodium.to_base64(salt, sodium.base64_variants.URLSAFE_NO_PADDING),
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
  return sodium.to_base64(priv, sodium.base64_variants.URLSAFE_NO_PADDING)
}

export async function encryptGroupKeyForUser(
  groupSecretKeyB64: string, // => venant de la DB
  userPublicKey: string,
  serverPrivateKey: string
) {
  await sodium.ready

  const groupSecretKey = sodium.from_base64(
    groupSecretKeyB64,
    sodium.base64_variants.URLSAFE_NO_PADDING
  )

  const userPubKeyBytes = sodium.from_base64(
    userPublicKey,
    sodium.base64_variants.URLSAFE_NO_PADDING
  )

  const serverPrivKeyBytes = sodium.from_base64(
    serverPrivateKey,
    sodium.base64_variants.URLSAFE_NO_PADDING
  )

  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)

  const encrypted = sodium.crypto_box_easy(
    groupSecretKey,
    nonce,
    userPubKeyBytes,
    serverPrivKeyBytes
  )

  return {
    nonce: sodium.to_base64(nonce, sodium.base64_variants.URLSAFE_NO_PADDING),
    ciphertext: sodium.to_base64(encrypted, sodium.base64_variants.URLSAFE_NO_PADDING),
  }
}
