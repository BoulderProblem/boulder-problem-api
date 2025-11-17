// app/Services/Firebase.ts

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import path from 'path'

const keyPath = path.join(__dirname, '../../config/serviceAccountKey.json')

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
})

export default admin
