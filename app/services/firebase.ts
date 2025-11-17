import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import app from '@adonisjs/core/services/app'

// Path vers le fichier JSON créé par CI/CD
const appRoot = fileURLToPath(app.appRoot)
const keyPath = path.join(appRoot, 'config/serviceAccountKey.json')

// Lecture du fichier JSON
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'))

// Initialisation de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export default admin
