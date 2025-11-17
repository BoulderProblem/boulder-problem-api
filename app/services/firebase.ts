import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// Recréer __dirname pour ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path vers le fichier JSON créé par CI/CD
const keyPath = path.join(__dirname, '../../config/serviceAccountKey.json')

// Lecture du fichier JSON
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'))

// Initialisation de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export default admin
